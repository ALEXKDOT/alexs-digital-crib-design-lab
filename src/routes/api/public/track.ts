import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  sid: z.string().uuid(),
  type: z.enum(["pageview", "heartbeat", "scroll", "outbound_click", "link_click", "download"]),
  path: z.string().max(300),
  target: z.string().max(300).optional(),
  src: z.string().max(80).nullable().optional(),
  referrer: z.string().max(500).nullable().optional(),
  activeMs: z.number().int().min(0).max(120_000).optional(),
  scroll: z.number().int().min(0).max(100).optional(),
  interacted: z.boolean().optional(),
});

const BOT_RE =
  /bot|crawl|spider|slurp|preview|scan|fetch|monitor|headless|lighthouse|python|curl|wget|axios|go-http|java\/|httpclient|proofpoint|mimecast|barracuda|safelinks|urldefense|phantom|puppeteer|playwright/i;

function parseUA(ua: string) {
  const device = /ipad|tablet/i.test(ua)
    ? "Tablet"
    : /mobi|iphone|android/i.test(ua)
      ? "Mobile"
      : "Desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /chrome|crios/i.test(ua)
      ? "Chrome"
      : /firefox|fxios/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Other";
  const os = /iphone|ipad|ios/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /mac os/i.test(ua)
        ? "macOS"
        : /windows/i.test(ua)
          ? "Windows"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

async function lookupIp(ip: string | null) {
  const token = process.env["IPINFO_TOKEN"];
  if (!ip || !token) return {};
  try {
    const res = await fetch(`https://api.ipinfo.io/lite/${encodeURIComponent(ip)}?token=${token}`, {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return {};
    const j = (await res.json()) as { asn?: string; as_name?: string; country?: string };
    return { asn: j.asn ?? null, org: j.as_name ?? null, country: j.country ?? null };
  } catch {
    return {};
  }
}

const ok = () => new Response(null, { status: 204 });

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.safeParse(await request.json());
        } catch {
          return ok();
        }
        if (!parsed.success) return ok();
        const d = parsed.data;
        const ua = (request.headers.get("user-agent") ?? "").slice(0, 400);
        const isBot = !ua || BOT_RE.test(ua);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: existing } = await supabaseAdmin
          .from("analytics_sessions")
          .select("*")
          .eq("id", d.sid)
          .maybeSingle();

        let session = existing;
        if (!session) {
          // IP is used only for this lookup and never stored.
          const ip =
            request.headers.get("cf-connecting-ip") ??
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            null;
          const geo = await lookupIp(ip);
          const cf = (
            request as unknown as { cf?: { city?: string; region?: string; country?: string } }
          ).cf;
          const row = {
            id: d.sid,
            src_tag: d.src ?? null,
            referrer: d.referrer ?? null,
            landing_path: d.path,
            user_agent: ua,
            ...parseUA(ua),
            country: geo.country ?? cf?.country ?? request.headers.get("cf-ipcountry"),
            region: cf?.region ?? null,
            city: cf?.city ?? null,
            asn: geo.asn ?? null,
            org: geo.org ?? null,
            is_bot: isBot,
          };
          await supabaseAdmin
            .from("analytics_sessions")
            .upsert(row, { onConflict: "id", ignoreDuplicates: true });
          const { data } = await supabaseAdmin
            .from("analytics_sessions")
            .select("*")
            .eq("id", d.sid)
            .maybeSingle();
          session = data;
        }
        if (!session) return ok();

        // Basic abuse cap per session.
        const { count } = await supabaseAdmin
          .from("analytics_events")
          .select("id", { count: "exact", head: true })
          .eq("session_id", d.sid);
        if ((count ?? 0) > 1000) return ok();

        if (d.type !== "heartbeat") {
          await supabaseAdmin
            .from("analytics_events")
            .insert({ session_id: d.sid, type: d.type, path: d.path, target: d.target ?? null });
        }

        const active_ms = session.active_ms + (d.activeMs ?? 0);
        const max_scroll = Math.max(session.max_scroll, d.scroll ?? 0);
        const interactions =
          session.interactions +
          (d.interacted || ["outbound_click", "link_click", "download"].includes(d.type) ? 1 : 0);
        const pageviews = session.pageviews + (d.type === "pageview" ? 1 : 0);
        const engaged =
          !session.is_bot &&
          (interactions > 0 ||
            active_ms >= 10_000 ||
            pageviews >= 2 ||
            (max_scroll >= 50 && active_ms >= 3_000));

        await supabaseAdmin
          .from("analytics_sessions")
          .update({
            active_ms,
            max_scroll,
            interactions,
            pageviews,
            engaged,
            last_seen_at: new Date().toISOString(),
            ...(d.src && !session.src_tag ? { src_tag: d.src } : {}),
          })
          .eq("id", d.sid);

        return ok();
      },
    },
  },
});
