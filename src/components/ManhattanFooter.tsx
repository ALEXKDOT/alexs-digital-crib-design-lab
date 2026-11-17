import { useEffect, useId, useRef, useState } from "react";

export type ManhattanFooterProps = {
  /** The supplied original PNG, or its Lovable/public asset URL. */
  imageSrc?: string;
  className?: string;
};

const STYLES =
  '.ak-mf { position:relative; width:100%; margin:0; color:#285d87; background:transparent; }\n.ak-mf__frame { position:relative; width:100%; aspect-ratio:5 / 1; overflow:hidden; }\n.ak-mf__art { display:block; width:100%; height:100%; overflow:hidden; }\n.ak-mf__ripple { fill:none; stroke-linecap:round; animation-play-state:paused; }\n.ak-mf__ripple--a { stroke:#204e72; stroke-width:1.05; animation:ak-mf-flow-a 16s ease-in-out infinite; animation-delay:-5s; animation-play-state:paused; }\n.ak-mf__ripple--b { stroke:#faf7f0; stroke-width:.9; animation:ak-mf-flow-b 19s ease-in-out infinite; animation-delay:-11s; animation-play-state:paused; }\n.ak-mf__ripple--c { stroke:#346e91; stroke-width:.85; animation:ak-mf-flow-c 13s ease-in-out infinite; animation-delay:-3s; animation-play-state:paused; }\n.ak-mf[data-running="true"] .ak-mf__ripple { animation-play-state:running; }\n.ak-mf__control { position:absolute; right:clamp(12px,3vw,48px); top:0; z-index:1; display:inline-flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; padding:0 10px; border:0; border-radius:4px; background:transparent; color:#355b76; font:500 11px/1.3 system-ui,sans-serif; cursor:pointer; }\n.ak-mf__control:hover { background:rgba(40,93,135,.055); }\n.ak-mf__control:focus-visible { outline:2px solid #285d87; outline-offset:-4px; }\n.ak-mf__control[hidden] { display:none; }\n@keyframes ak-mf-flow-a { 0%,100% { transform:translate(-3px,0); opacity:.13; } 50% { transform:translate(3px,.25px); opacity:.27; } }\n@keyframes ak-mf-flow-b { 0%,100% { transform:translate(2px,0); opacity:.19; } 50% { transform:translate(-3px,-.25px); opacity:.31; } }\n@keyframes ak-mf-flow-c { 0%,100% { transform:translate(-2px,.15px); opacity:.12; } 50% { transform:translate(3px,-.15px); opacity:.23; } }\n@media (max-width:600px) { .ak-mf__frame { aspect-ratio:2.8 / 1; } .ak-mf__control { top:-2px; right:6px; font-size:10px; } }\n@media (prefers-reduced-motion:reduce) { .ak-mf .ak-mf__ripple { animation:none !important; transform:none !important; opacity:.14; } .ak-mf__control { display:none; } }';
const RIPPLE_PATHS = [
  "M 25.9 664.9 q 13.2 -0.22 27.6 -0.22 t 29.9 0.22 M 138.5 672.1 q 13.8 -0.37 28.8 -0.37 t 31.3 0.37 M 236.6 681.1 q 6.3 0.16 13.1 0.16 t 14.2 -0.16 M 303.7 687.0 q 14.8 -0.38 31.0 -0.38 t 33.5 0.38 M 400.7 664.7 q 5.8 -0.00 12.1 -0.00 t 13.1 0.00 M 495.5 671.9 q 13.1 -0.23 27.3 -0.23 t 29.6 0.23 M 599.6 679.5 q 14.7 -0.25 30.8 -0.25 t 33.3 0.25 M 708.9 688.3 q 11.6 -0.24 24.3 -0.24 t 26.3 0.24 M 785.5 666.5 q 7.1 -0.11 14.8 -0.11 t 16.0 0.11 M 909.6 673.8 q 8.2 -0.15 17.2 -0.15 t 18.6 0.15 M 985.6 679.4 q 10.8 -0.42 22.5 -0.42 t 24.4 0.42 M 1075.6 685.9 q 8.9 0.04 18.5 0.04 t 20.0 -0.04 M 1180.8 665.8 q 14.0 0.31 29.1 0.31 t 31.6 -0.31 M 1281.9 674.2 q 5.1 0.09 10.6 0.09 t 11.5 -0.09 M 1389.3 679.7 q 10.0 -0.27 20.8 -0.27 t 22.6 0.27 M 1489.6 686.1 q 11.5 0.24 24.1 0.24 t 26.1 -0.24 M 1589.2 667.3 q 7.0 -0.38 14.5 -0.38 t 15.7 0.38 M 1664.1 674.0 q 11.7 0.26 24.5 0.26 t 26.5 -0.26 M 1767.4 680.1 q 16.3 -0.12 34.1 -0.12 t 36.9 0.12 M 1864.2 687.5 q 15.0 0.44 31.3 0.44 t 33.9 -0.44 M 1965.2 664.6 q 6.1 -0.52 12.8 -0.52 t 13.9 0.52 M 2041.1 673.4 q 9.3 -0.45 19.4 -0.45 t 21.0 0.45",
  "M 36.3 668.3 q 10.9 0.37 22.8 0.37 t 24.7 -0.37 M 104.9 674.9 q 11.8 -0.02 24.6 -0.02 t 26.6 0.02 M 206.7 682.8 q 14.9 0.54 31.1 0.54 t 33.7 -0.54 M 319.1 688.1 q 7.9 -0.51 16.4 -0.51 t 17.8 0.51 M 431.4 667.8 q 8.2 -0.53 17.1 -0.53 t 18.5 0.53 M 501.6 676.4 q 12.7 -0.46 26.5 -0.46 t 28.8 0.46 M 595.2 683.3 q 8.7 0.30 18.2 0.30 t 19.7 -0.30 M 709.1 687.7 q 15.1 0.38 31.5 0.38 t 34.1 -0.38 M 817.1 666.8 q 7.8 -0.20 16.3 -0.20 t 17.6 0.20 M 909.8 675.2 q 16.2 0.30 33.8 0.30 t 36.6 -0.30 M 976.9 682.3 q 6.1 0.35 12.6 0.35 t 13.7 -0.35 M 1071.4 688.3 q 12.2 0.36 25.4 0.36 t 27.5 -0.36 M 1172.9 669.0 q 6.2 -0.13 12.9 -0.13 t 13.9 0.13 M 1295.9 674.9 q 12.9 -0.04 26.8 -0.04 t 29.1 0.04 M 1388.4 682.9 q 10.6 -0.34 22.1 -0.34 t 23.9 0.34 M 1459.6 688.9 q 7.6 -0.21 15.8 -0.21 t 17.2 0.21 M 1563.9 667.1 q 16.3 -0.18 34.1 -0.18 t 37.0 0.18 M 1689.6 673.6 q 11.2 0.43 23.4 0.43 t 25.3 -0.43 M 1774.6 681.1 q 12.7 0.05 26.6 0.05 t 28.8 -0.05 M 1868.0 689.2 q 12.9 0.32 27.0 0.32 t 29.2 -0.32 M 1945.9 669.4 q 12.2 -0.14 25.4 -0.14 t 27.5 0.14 M 2045.2 674.2 q 5.8 0.30 12.1 0.30 t 13.1 -0.30",
  "M 12.8 668.8 q 10.2 0.24 21.3 0.24 t 23.1 -0.24 M 107.7 678.0 q 16.2 0.19 33.8 0.19 t 36.6 -0.19 M 201.1 684.8 q 15.0 -0.09 31.4 -0.09 t 34.0 0.09 M 330.1 690.5 q 5.9 0.37 12.3 0.37 t 13.3 -0.37 M 402.3 671.2 q 13.3 -0.09 27.7 -0.09 t 30.0 0.09 M 512.7 677.1 q 8.9 0.33 18.6 0.33 t 20.2 -0.33 M 619.3 683.1 q 12.1 0.29 25.3 0.29 t 27.4 -0.29 M 703.0 691.9 q 15.9 0.27 33.2 0.27 t 36.0 -0.27 M 787.0 671.4 q 15.3 -0.21 32.0 -0.21 t 34.6 0.21 M 909.7 675.7 q 14.1 0.07 29.4 0.07 t 31.9 -0.07 M 1009.5 683.8 q 13.2 0.34 27.5 0.34 t 29.8 -0.34 M 1103.1 690.3 q 6.0 -0.10 12.5 -0.10 t 13.5 0.10 M 1180.1 671.5 q 5.8 0.37 12.1 0.37 t 13.1 -0.37 M 1293.8 677.9 q 7.1 0.36 14.8 0.36 t 16.0 -0.36 M 1398.0 685.1 q 12.9 0.17 26.9 0.17 t 29.1 -0.17 M 1490.5 692.1 q 14.8 -0.47 30.9 -0.47 t 33.4 0.47 M 1558.4 670.1 q 5.1 0.25 10.6 0.25 t 11.5 -0.25 M 1685.8 676.7 q 10.9 -0.29 22.8 -0.29 t 24.7 0.29 M 1762.3 683.7 q 8.4 0.29 17.4 0.29 t 18.9 -0.29 M 1859.5 690.9 q 10.1 0.11 21.0 0.11 t 22.8 -0.11 M 1965.6 668.5 q 15.6 0.05 32.5 0.05 t 35.2 -0.05 M 2065.0 678.4 q 12.2 0.22 25.4 0.22 t 27.5 -0.22",
];
const PAUSE_KEY = "alex-krawec-water-paused";

/** No animation library. The skyline bitmap never moves; only masked SVG strokes animate. */
export default function ManhattanFooter({
  imageSrc = "/manhattan-footer.png",
  className = "",
}: ManhattanFooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const uid = "ak-mf-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [paused, setPaused] = useState(false);
  const running = inView && pageVisible && !reducedMotion && !paused;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    try {
      setPaused(sessionStorage.getItem(PAUSE_KEY) === "true");
    } catch {
      /* Storage can be unavailable. */
    }
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    const target = rootRef.current;
    if (!target) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      threshold: 0,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const togglePaused = () => {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem(PAUSE_KEY, String(next));
    } catch {
      /* Animation still works without storage. */
    }
  };

  return (
    <figure
      ref={rootRef}
      className={`ak-mf ${className}`}
      data-running={running ? "true" : "false"}
    >
      <style>{STYLES}</style>
      <div className="ak-mf__frame">
        <svg
          className="ak-mf__art"
          width="2172"
          height="434.4"
          viewBox="0 289.6 2172 434.4"
          preserveAspectRatio="xMidYMax slice"
          role="img"
          aria-labelledby={`${uid}-title`}
        >
          <title id={`${uid}-title`}>
            Lower Manhattan and the Brooklyn Bridge in blue engraved linework
          </title>
          <defs>
            <linearGradient
              id={`${uid}-fade`}
              x1="0"
              y1="658"
              x2="0"
              y2="709"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset=".22" stopColor="white" stopOpacity=".85" />
              <stop offset=".66" stopColor="white" stopOpacity="1" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask
              id={`${uid}-water`}
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x="0"
              y="658"
              width="2172"
              height="66"
              style={{ maskType: "luminance" }}
            >
              <path
                d="M 6 660 L 2168 660 L 2168 690 Q 2100 707 1980 704 L 130 704 Q 45 690 6 666 Z"
                fill={`url(#${uid}-fade)`}
              />
              <path d="M 1465 650 L 1575 650 L 1575 667 L 1465 667 Z" fill="black" />
            </mask>
          </defs>
          <image href={imageSrc} x="0" y="0" width="2172" height="724" />
          <g mask={`url(#${uid}-water)`}>
            {RIPPLE_PATHS.map((d, index) => (
              <path
                key={index}
                className={`ak-mf__ripple ak-mf__ripple--${["a", "b", "c"][index]}`}
                d={d}
              />
            ))}
          </g>
        </svg>
      </div>
      {!reducedMotion && (
        <button
          className="ak-mf__control"
          type="button"
          onClick={togglePaused}
          aria-label={paused ? "Play water animation" : "Pause water animation"}
        >
          {paused ? "Play water" : "Pause water"}
        </button>
      )}
    </figure>
  );
}
