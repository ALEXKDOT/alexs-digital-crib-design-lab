import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Session = Tables<"analytics_sessions">;
type Event = Tables<"analytics_events">;
type Inst = Tables<"target_institutions">;

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Private" },
      { name: "description", content: "Private visit analytics." },
      { property: "og:title", content: "Analytics — Private" },
      { property: "og:description", content: "Private visit analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AnalyticsPage,
});

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

function matchInstitution(org: string | null, insts: Inst[]): Inst | null {
  if (!org) return null;
  const o = org.toLowerCase();
  return (
    insts.find((i) =>
      [i.name, ...i.aliases].some((k) => k.trim() && o.includes(k.trim().toLowerCase())),
    ) ?? null
  );
}

const fmtDur = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

function Badge({ kind }: { kind: "Observed" | "Inferred" }) {
  return (
    <span
      className={
        "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
        (kind === "Inferred" ? "bg-accent text-primary-foreground" : "bg-secondary text-foreground")
      }
    >
      {kind}
    </span>
  );
}

function AnalyticsPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [insts, setInsts] = useState<Inst[]>([]);
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(daysAgo(0));
  const [org, setOrg] = useState("");
  const [src, setSrc] = useState("");
  const [inst, setInst] = useState("");
  const [engagedOnly, setEngagedOnly] = useState(false);
  const [showBots, setShowBots] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      setIsAdmin(!!data);
    })();
  }, []);

  const loadInsts = async () => {
    const { data } = await supabase.from("target_institutions").select("*").order("name");
    setInsts(data ?? []);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadInsts();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from("analytics_sessions")
      .select("*")
      .gte("started_at", `${from}T00:00:00`)
      .lte("started_at", `${to}T23:59:59.999`)
      .order("started_at", { ascending: false })
      .limit(2000)
      .then(({ data }) => setSessions(data ?? []));
  }, [isAdmin, from, to]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("analytics_events")
      .select("*")
      .eq("session_id", open)
      .order("ts")
      .then(({ data }) => setEvents(data ?? []));
  }, [open]);

  const rows = useMemo(
    () =>
      sessions
        .map((s) => ({ s, match: matchInstitution(s.org, insts) }))
        .filter(({ s, match }) => {
          if (!showBots && s.is_bot) return false;
          if (engagedOnly && !s.engaged) return false;
          if (org && s.org !== org) return false;
          if (src && s.src_tag !== src) return false;
          if (inst && match?.id !== inst) return false;
          return true;
        }),
    [sessions, insts, showBots, engagedOnly, org, src, inst],
  );

  const orgs = [...new Set(sessions.map((s) => s.org).filter(Boolean))].sort() as string[];
  const srcs = [...new Set(sessions.map((s) => s.src_tag).filter(Boolean))].sort() as string[];
  const human = sessions.filter((s) => !s.is_bot);

  if (isAdmin === null) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  if (!isAdmin)
    return (
      <main className="p-8">
        <p className="text-sm text-foreground">This account does not have access.</p>
        <button
          className="mt-4 text-sm underline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </button>
      </main>
    );

  const sel = "rounded-md border border-input bg-background px-2 py-1.5 text-sm";

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Visit analytics</h1>
        <button
          className="text-sm text-muted-foreground underline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Sign out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Raw page loads (sessions)", sessions.length],
          ["Likely automated", sessions.length - human.length],
          ["Engaged human sessions", human.filter((s) => s.engaged).length],
          [
            "Possible institutional (inferred)",
            human.filter((s) => matchInstitution(s.org, insts)).length,
          ],
        ].map(([label, n]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-2xl font-semibold">{n}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted-foreground">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={`${sel} block`}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={`${sel} block`}
          />
        </label>
        <select value={org} onChange={(e) => setOrg(e.target.value)} className={sel}>
          <option value="">All organizations</option>
          {orgs.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={src} onChange={(e) => setSrc(e.target.value)} className={sel}>
          <option value="">All source tags</option>
          {srcs.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select value={inst} onChange={(e) => setInst(e.target.value)} className={sel}>
          <option value="">All target institutions</option>
          {insts.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={engagedOnly}
            onChange={(e) => setEngagedOnly(e.target.checked)}
          />
          Engaged only
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={showBots}
            onChange={(e) => setShowBots(e.target.checked)}
          />
          Show automated
        </label>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        <Badge kind="Observed" /> recorded from the visit or IP lookup. <Badge kind="Inferred" />{" "}
        organization name matched a target institution keyword; this is a hint, not confirmation.
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              {[
                "Time",
                "Source",
                "Referrer",
                "Pages",
                "Active",
                "Scroll",
                "Device",
                "Location",
                "Organization / ASN",
                "Institution",
                "Status",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-muted-foreground">
                  No sessions match.
                </td>
              </tr>
            )}
            {rows.map(({ s, match }) => (
              <Fragment key={s.id}>
                <tr
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                  className="cursor-pointer border-t border-border hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-3 py-2">
                    {new Date(s.started_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{s.src_tag ?? "—"}</td>
                  <td className="max-w-[160px] truncate px-3 py-2">{s.referrer ?? "direct"}</td>
                  <td className="px-3 py-2">{s.pageviews}</td>
                  <td className="px-3 py-2">{fmtDur(s.active_ms)}</td>
                  <td className="px-3 py-2">{s.max_scroll}%</td>
                  <td className="px-3 py-2">
                    {s.device} · {s.browser} · {s.os}
                  </td>
                  <td className="px-3 py-2">
                    {[s.city, s.region, s.country].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2">
                    {s.org ?? "—"}
                    {s.asn && <span className="ml-1 text-xs text-muted-foreground">{s.asn}</span>}
                  </td>
                  <td className="px-3 py-2">
                    {match ? (
                      <span className="flex items-center gap-1">
                        {match.name} <Badge kind="Inferred" />
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {s.is_bot ? "Automated" : s.engaged ? "Engaged" : "Page load only"}
                  </td>
                </tr>
                {open === s.id && (
                  <tr key={`${s.id}-ev`} className="bg-muted/30">
                    <td colSpan={11} className="px-6 py-3">
                      <div className="mb-2 text-xs text-muted-foreground">
                        User agent: {s.user_agent}
                      </div>
                      <ul className="space-y-1 text-xs">
                        {events.map((e) => (
                          <li key={e.id}>
                            <span className="text-muted-foreground">
                              {new Date(e.ts).toLocaleTimeString()}
                            </span>{" "}
                            <strong>{e.type}</strong> {e.path} {e.target && `· ${e.target}`}
                          </li>
                        ))}
                        {events.length === 0 && (
                          <li className="text-muted-foreground">No events.</li>
                        )}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <InstitutionsEditor insts={insts} reload={loadInsts} />
    </main>
  );
}

function InstitutionsEditor({ insts, reload }: { insts: Inst[]; reload: () => void }) {
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from("target_institutions").insert({
      name: name.trim(),
      aliases: aliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    });
    setName("");
    setAliases("");
    reload();
  };
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg">Target institutions</h2>
      <p className="text-xs text-muted-foreground">
        Sessions whose network organization contains the name or any keyword are flagged as possible
        institutional traffic.
      </p>
      <form onSubmit={add} className="mt-3 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Weill Cornell)"
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <input
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          placeholder="Keywords, comma-separated (e.g. Cornell, NewYork-Presbyterian)"
          className="min-w-[320px] flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
        <button className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground">
          Add
        </button>
      </form>
      <ul className="mt-3 divide-y divide-border rounded-lg border border-border">
        {insts.length === 0 && (
          <li className="px-3 py-2 text-sm text-muted-foreground">None yet.</li>
        )}
        {insts.map((i) => (
          <li key={i.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <span>
              <strong>{i.name}</strong>
              {i.aliases.length > 0 && (
                <span className="text-muted-foreground"> · {i.aliases.join(", ")}</span>
              )}
            </span>
            <button
              className="text-xs text-muted-foreground underline"
              onClick={async () => {
                await supabase.from("target_institutions").delete().eq("id", i.id);
                reload();
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
