// Anonymous, cookie-less visit tracker. Session ID lives only in sessionStorage
// (cleared when the tab closes). No fingerprinting.

const ENDPOINT = "/api/public/track";
const HEARTBEAT_MS = 15_000;

type Payload = {
  sid: string;
  type: string;
  path: string;
  target?: string;
  src?: string | null;
  referrer?: string | null;
  activeMs?: number;
  scroll?: number;
  interacted?: boolean;
};

function excluded(path: string) {
  return path.startsWith("/admin") || path.startsWith("/auth");
}

function getSid(): string {
  let sid = sessionStorage.getItem("ak_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ak_sid", sid);
  }
  return sid;
}

function getSrc(): string | null {
  const fromUrl = new URLSearchParams(location.search).get("src");
  if (fromUrl) {
    const clean = fromUrl.slice(0, 80).replace(/[^\w.-]/g, "");
    sessionStorage.setItem("ak_src", clean);
    return clean;
  }
  return sessionStorage.getItem("ak_src");
}

function send(p: Payload) {
  const body = JSON.stringify(p);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* fall through */
  }
  fetch(ENDPOINT, {
    method: "POST",
    body,
    keepalive: true,
    headers: { "content-type": "application/json" },
  }).catch(() => {});
}

let started = false;

export function startAnalytics(): (path: string) => void {
  const noop = () => {};
  if (started || typeof window === "undefined") return noop;
  if (navigator.webdriver) return noop;
  started = true;

  const sid = getSid();
  const src = getSrc();
  let activeMs = 0;
  let lastTick = Date.now();
  let lastInteraction = 0;
  let interacted = false;
  let maxScroll = 0;
  const milestones = new Set<number>();

  const path = () => location.pathname;

  const tick = () => {
    const now = Date.now();
    // Count time only while visible and recently interacted (within 30s).
    if (document.visibilityState === "visible" && now - lastInteraction < 30_000) {
      activeMs += now - lastTick;
    }
    lastTick = now;
  };

  const markInteraction = (real: boolean) => {
    tick();
    lastInteraction = Date.now();
    if (real) interacted = true;
  };

  const flush = (type: string) => {
    tick();
    if (excluded(path())) return;
    send({ sid, type, path: path(), activeMs, scroll: maxScroll, interacted });
    activeMs = 0;
    interacted = false;
  };

  ["pointerdown", "keydown", "touchstart"].forEach((e) =>
    window.addEventListener(e, () => markInteraction(true), { passive: true }),
  );
  window.addEventListener("mousemove", () => markInteraction(false), { passive: true });

  window.addEventListener(
    "scroll",
    () => {
      markInteraction(false);
      const doc = document.documentElement;
      const pct = Math.min(
        100,
        Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100),
      );
      if (pct > maxScroll) maxScroll = pct;
      for (const m of [25, 50, 75, 100]) {
        if (pct >= m && !milestones.has(m)) {
          milestones.add(m);
          if (!excluded(path()))
            send({ sid, type: "scroll", path: path(), target: `${m}%`, scroll: maxScroll });
        }
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || excluded(path())) return;
      const href = a.getAttribute("href") ?? "";
      const label = (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
      const isOutbound = /^https?:/i.test(href) && !href.includes(location.host);
      const type = a.hasAttribute("download")
        ? "download"
        : isOutbound
          ? "outbound_click"
          : "link_click";
      send({ sid, type, path: path(), target: `${label} → ${href}`.slice(0, 300) });
    },
    { capture: true },
  );

  setInterval(() => {
    if (document.visibilityState === "visible") flush("heartbeat");
  }, HEARTBEAT_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush("heartbeat");
    else lastTick = Date.now();
  });
  window.addEventListener("pagehide", () => flush("heartbeat"));

  let lastPath = "";
  const pageview = (p: string) => {
    if (p === lastPath || excluded(p)) return;
    const first = lastPath === "";
    lastPath = p;
    send({
      sid,
      type: "pageview",
      path: p,
      src,
      referrer: first ? document.referrer || null : null,
    });
  };
  pageview(path());
  return pageview;
}
