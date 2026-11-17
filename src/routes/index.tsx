import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import cvAsset from "@/assets/alexander-krawec-cv.pdf.asset.json";
import limbwatchAsset from "@/assets/limbwatch.png.asset.json";
import responsemapAsset from "@/assets/responsemap-preview.webp.asset.json";
import responsemapVideo from "@/assets/responsemap-preview.mp4.asset.json";
import responsemapWebm from "@/assets/responsemap-preview.webm.asset.json";
import clinicalVideo from "@/assets/clinical-timeline-preview.mp4.asset.json";
import clinicalWebm from "@/assets/clinical-timeline-preview.webm.asset.json";
import clinicalShot from "@/assets/clinical-timeline-preview.webp.asset.json";
import edVideo from "@/assets/ed-throughput-preview.mp4.asset.json";
import edWebm from "@/assets/ed-throughput-preview.webm.asset.json";
import edShot from "@/assets/ed-throughput-preview.webp.asset.json";
import nmatlasVideo from "@/assets/nmatlas-preview.mp4.asset.json";
import nmatlasWebm from "@/assets/nmatlas-preview.webm.asset.json";
import nmatlasShot from "@/assets/nmatlas-poster.webp.asset.json";
import manhattanFooter from "@/assets/manhattan-footer.png.asset.json";
import SkylineWater from "@/components/SkylineWater";
import { PortfolioDesignPrototypes, type PrototypeVariant } from "./-portfolio-design-prototypes";

const TITLE = "Alex Krawec — Medicine, Education & Design";
const DESCRIPTION =
  "Alex Krawec is a UCLA medical student interested in psychiatry, medical education, and biodesign. Explore selected projects, teaching work, and his CV.";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { variant?: PrototypeVariant } => {
    const variant = search["variant"];
    return variant === "A" || variant === "B" || variant === "C" ? { variant } : {};
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "page-type", content: "service" },
      { name: "site-kind", content: "other" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://alexkrawec.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://alexkrawec.com/" }],
  }),
  component: Index,
});

const CV_URL = cvAsset.url;
const EMAIL = "KrawecERAS@Gmail.com";
const GITHUB_URL = "https://github.com/ALEXKDOT";
const NMATLAS_URL =
  "https://alexkdot.github.io/NMAtlas/?v=0.17.0#topic=tms-depression&target=dlpfc&map=off&regions=&regionOpacity=0.16&hemisphere=both&view=free&cortex=0.065&mapOpacity=0.28&labels=false&bundles=CS_A&tractMode=suggested&panel=targets";

const link =
  "font-medium text-primary underline decoration-border underline-offset-4 transition-colors duration-150 hover:text-accent hover:decoration-accent";
const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-[2px] border border-primary bg-primary px-5 text-[0.95rem] font-semibold tracking-[0.01em] text-primary-foreground transition-[background-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:bg-accent hover:shadow-print active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const btnSecondary =
  "inline-flex min-h-11 items-center justify-center rounded-[2px] border border-foreground bg-paper px-5 text-[0.95rem] font-semibold tracking-[0.01em] text-foreground transition-[color,border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-accent hover:text-accent hover:shadow-print active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const meta = "text-sm text-muted-foreground";

function Details({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="mt-5 border-t border-border pt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm text-left text-base font-medium text-primary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-[220ms] ease-out"
          style={{ transform: open ? "rotate(90deg)" : "none" }}
        >
          ›
        </span>
        {label}
      </button>
      <div
        id={id}
        role="region"
        aria-label={label}
        inert={!open}
        className="disclosure"
        data-open={open}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="pt-2 text-base leading-relaxed text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.8 && r.bottom > 0) return; // already visible: no flash
    el.classList.add("reveal-pending");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("reveal-in");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    const fallback = window.setTimeout(() => el.classList.add("reveal-in"), 8000);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="overflow-hidden rounded-[3px] border border-border bg-paper shadow-plate transition-[box-shadow,border-color,transform] duration-200 ease-out group-hover/link:-translate-y-0.5 group-hover/link:border-primary/50 group-hover/link:shadow-plate-hover group-focus-visible/link:border-primary">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
        <span className="ml-3 truncate text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="ml-auto shrink-0 text-[0.6875rem] uppercase tracking-[0.14em] text-primary opacity-0 transition-opacity duration-200 group-hover/link:opacity-100 group-focus-visible/link:opacity-100"
        >
          Open live ↗
        </span>
      </div>
      {children}
    </div>
  );
}

function fallbackRef(setFailed: (failed: boolean) => void) {
  return (node: HTMLVideoElement | null) => {
    // A source can fail before React attaches its handlers; catch that state at mount.
    if (node && (node.error || node.networkState === 3)) setFailed(true);
  };
}

function ResponseMapPreview() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <img
        src={responsemapAsset.url}
        width={1920}
        height={1350}
        loading="lazy"
        alt="ResponseMap daily journal showing 1-to-10 rating buttons for focus, difficulty starting tasks, and energy, a note field, and a 24-hour chart of the day's ratings."
        className="block aspect-[1920/1350] h-auto w-full bg-card object-cover object-top"
      />
    );
  }
  return (
    <video
      ref={fallbackRef(setFailed)}
      poster={responsemapAsset.url}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      width={1920}
      height={1350}
      aria-label="Screen recording of the ResponseMap daily journal: selecting 1-to-10 ratings for focus, difficulty starting tasks, and energy, then logging a medication dose, while the 24-hour chart updates."
      className="block h-auto w-full bg-card"
    >
      <source src={responsemapVideo.url} type="video/mp4" onError={() => setFailed(true)} />
      <source src={responsemapWebm.url} type="video/webm" onError={() => setFailed(true)} />
    </video>
  );
}

function ClinicalTimelinePreview() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <img
        src={clinicalShot.url}
        width={1920}
        height={1329}
        loading="lazy"
        alt="Clinical Timeline review view for a fictional patient, showing a record activity scrubber and rows for hospital care, visits, MyChart messages, telephone calls, results, and medication events across February to April 2026."
        className="block aspect-[1920/1329] h-auto w-full bg-card object-cover object-top"
      />
    );
  }
  return (
    <video
      ref={fallbackRef(setFailed)}
      poster={clinicalShot.url}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      width={1920}
      height={1350}
      aria-label="Screen recording of the Clinical Timeline review view: scrubbing the date range over a record activity chart while rows for hospital care, visits, MyChart messages, telephone calls, results, and medication events update."
      className="block h-auto w-full bg-card"
    >
      <source src={clinicalVideo.url} type="video/mp4" onError={() => setFailed(true)} />
      <source src={clinicalWebm.url} type="video/webm" onError={() => setFailed(true)} />
    </video>
  );
}

function EDThroughputPreview() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <img
        src={edShot.url}
        width={1740}
        height={1294}
        loading="lazy"
        alt="Emergency department simulation map showing patient markers distributed across waiting, trauma, main, fast track, hallway, behavioral, observation, imaging, boarding, and discharge areas."
        className="block aspect-[1740/1294] h-auto w-full bg-card object-cover object-top"
      />
    );
  }
  return (
    <video
      ref={fallbackRef(setFailed)}
      poster={edShot.url}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      width={1600}
      height={1124}
      aria-label="Screen recording of the emergency department simulation replay: patient markers move through triage, care spaces, imaging, boarding, and discharge as the census counts update."
      className="block h-auto w-full bg-card"
    >
      <source src={edVideo.url} type="video/mp4" onError={() => setFailed(true)} />
      <source src={edWebm.url} type="video/webm" onError={() => setFailed(true)} />
    </video>
  );
}

function NMAtlasPreview() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <img
        src={nmatlasShot.url}
        width={1600}
        height={1124}
        loading="lazy"
        alt="NMAtlas research atlas showing the Depression and TMS focus with the DLPFC target selected: a translucent 3D brain with rust-colored fiber tracts and target markers, beside a sidebar listing anatomical targets and study-defined targeting approaches."
        className="block aspect-[1600/1124] h-auto w-full bg-card object-cover object-top"
      />
    );
  }
  return (
    <video
      ref={fallbackRef(setFailed)}
      poster={nmatlasShot.url}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
      width={1600}
      height={1124}
      aria-label="Screen recording of the NMAtlas research atlas: rotating a translucent 3D brain with the DLPFC target selected, then hovering a rust-colored fiber tract to open a reference card with anatomical context and cited studies."
      className="block h-auto w-full bg-card"
    >
      <source src={nmatlasVideo.url} type="video/mp4" onError={() => setFailed(true)} />
      <source src={nmatlasWebm.url} type="video/webm" onError={() => setFailed(true)} />
    </video>
  );
}

type Feature = {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  metadata: string;
  image: ReactNode;
  caption?: string;
  description: string;
  extra?: string;
  actions?: ReactNode;
  detailsLabel?: string;
  details?: string;
  notice?: string[];
};

const FEATURES: Feature[] = [
  {
    id: "nmatlas",
    title: "NMAtlas",
    subtitle: "Atlas of neuromodulation targets",
    notice: ["8 GB RAM minimum · 16 GB suggested", "May not run on hospital computers"],
    domain: "NEUROMODULATION · EDUCATION",
    metadata: "\n",
    image: (
      <a
        href={NMATLAS_URL}
        aria-label="Open the NMAtlas demo"
        className="group/link block rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Frame label="NMATLAS · LIVE EDUCATIONAL APP">
          <NMAtlasPreview />
        </Frame>
      </a>
    ),
    caption: "\n",
    description:
      "An interactive, 3D neuroanatomy atlas of neuromodulation targets and protocols, with references to underlying research findings.",
    actions: (
      <a href={NMATLAS_URL} className={btnPrimary}>
        Open NMAtlas demo{" "}
        <span aria-hidden="true" className="ml-2">
          →
        </span>
      </a>
    ),
    detailsLabel: "More about NMAtlas",
    details:
      "This application is an evidence-backed 3D atlas of brain tracts and gross anatomy relevant to neuromodulation treatments. It draws on published tractography data, fMRI, and other functional imaging research. It includes a guided educational component for graduate medical students.",
  },
  {
    id: "responsemap",
    title: "ResponseMap",
    subtitle: "ADHD symptom and medication journal",
    domain: "Psychiatry · Patient tools",
    metadata: "\n",
    image: (
      <a
        href="https://alexkdot.github.io/psych-med-visualizer/"
        aria-label="Open the ResponseMap demo"
        className="group/link block rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Frame label="ResponseMap · live prototype">
          <ResponseMapPreview />
        </Frame>
      </a>
    ),
    caption: "\n",
    description:
      "A journal prototype for recording symptoms, context, and medication timing throughout the day. It brings those observations into a shared visual timeline to support more structured conversations between patients and clinicians.",
    extra: "\n",
    actions: (
      <>
        <a href="https://alexkdot.github.io/psych-med-visualizer/" className={btnPrimary}>
          Open ResponseMap demo{" "}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </a>
      </>
    ),
    detailsLabel: "More about ResponseMap",
    details:
      "The design question is how to make experiences between appointments easier to record and discuss. The prototype includes manual check-ins, selectable variables, medication-event markers, and review views. Entries remain only in the open session and clear when the page is reloaded or closed. The current version does not include saved records or provider sharing, and it does not establish medication effects or recommend treatment changes.",
  },
  {
    id: "clinical-timeline",
    title: "Clinical Timeline",
    subtitle: "A visual chronology of patient records",
    domain: "Clinical informatics",
    metadata: "\n",
    image: (
      <a
        href="https://alexkdot.github.io/ehr-timeline-view/"
        aria-label="Open the Clinical Timeline demo"
        className="group/link block rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Frame label="Clinical Timeline · live prototype">
          <ClinicalTimelinePreview />
        </Frame>
      </a>
    ),
    caption: "\n",
    description:
      "A visual chronology of encounters, messages, care transitions, and medication history, exploring how fragmented records could become easier to review.",
    actions: (
      <a href="https://alexkdot.github.io/ehr-timeline-view/" className={btnPrimary}>
        Open Clinical Timeline demo{" "}
        <span aria-hidden="true" className="ml-2">
          →
        </span>
      </a>
    ),
    detailsLabel: "More about Clinical Timeline",
    details:
      "The current demonstration uses fictional information. It is not a live EHR connection, a complete medical chart, or an automated record-import system.",
  },
  {
    id: "ed-throughput",
    title: "ED Throughput Sandbox",
    subtitle: "Emergency department flow simulation",
    domain: "HEALTH SYSTEMS IMPROVEMENT",
    metadata: "\n",
    image: (
      <a
        href="https://alexkdot.github.io/ed-throughput-sandbox/#visualizer"
        aria-label="Open the ED Throughput Sandbox demo"
        className="group/link block rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <Frame label="ED THROUGHPUT · SIM PROTOTYPE">
          <EDThroughputPreview />
        </Frame>
      </a>
    ),
    caption: "\n",
    description:
      "An educational simulation for exploring how arrivals, treatment capacity, diagnostic queues, and boarding assumptions affect synthetic patient flow.",
    actions: (
      <a href="https://alexkdot.github.io/ed-throughput-sandbox/#visualizer" className={btnPrimary}>
        Open ED Throughput demo{" "}
        <span aria-hidden="true" className="ml-2">
          →
        </span>
      </a>
    ),
    detailsLabel: "More about ED Throughput Sandbox",
    details:
      "The project supports scenario comparisons and replay of a representative synthetic week. Its assumptions have not been calibrated to a particular hospital; it is an exploratory model, not a validated operational forecasting tool.",
  },
  {
    id: "limbwatch",
    title: "LimbWatch",
    subtitle: "Wearable perfusion-monitoring concept",
    domain: "Biodesign · Medical device",
    metadata: "UCLA–Anderson Biodesign · Device prototype",
    image: (
      <Frame label="LIMBWATCH · PRODUCT CONCEPT">
        <div className="flex aspect-[3/2] items-center justify-center bg-white">
          <img
            src={limbwatchAsset.url}
            width={668}
            height={668}
            loading="lazy"
            alt="LimbWatch concept illustration showing sensor patches on a foot connected to a small monitor."
            className="block h-full w-auto max-w-full object-contain"
          />
        </div>
      </Frame>
    ),
    caption: "Concept illustration; development is ongoing.",
    description:
      "Through the UCLA–Anderson Biodesign Fellowship, I began developing a wearable sensor concept to explore more consistent tracking of lower-extremity perfusion. The project grew from the burden of repeated bedside pulse assessments and remains in early development.",
    detailsLabel: "More about LimbWatch",
    details:
      "The concept uses photoplethysmography, or PPG, to explore quantitative monitoring over time. The broader biodesign work considered clinical workflows, stakeholder needs, adoption barriers, and feasibility. It remains a prototype rather than a validated clinical device.",
  },
];

type Project = {
  title: string;
  status: string;
  description: string;
  extra?: string;
  action: string;
  url: string;
  details: string;
};

const MORE: Project[] = [
  {
    title: "Nokota MCAT Tutoring",
    status: "Founder and Lead Instructor",
    description:
      "I founded Nokota to support learners whose needs are poorly served by standard preparation plans. The program now offers free MCAT tutoring and premedical advising to accepted participants who are neurodivergent, financially under-resourced, or both, with study plans and materials shaped around each learner's barriers.",
    extra: "25+ learners supported · 250+ hours of tutoring and advising",
    action: "Visit Nokota",
    url: "https://nokotamcat.com/",
    details:
      "My work includes individualized study planning, curriculum and practice-material development, tutoring, and advising. The program grew from gaps I encountered while working in commercial test preparation. Its emphasis is on adapting the preparation process to the learner's cognitive, academic, and practical constraints.",
  },
  {
    title: "Frontier Signal",
    description:
      "A source-linked dashboard for exploring frontier AI incidents, capabilities, safeguards, and governance, with explanations intended to make the evidence easier to assess.",
    status: "Research dashboard",
    action: "Explore dashboard",
    url: "https://alexkdot.github.io/frontier-signal/",
    details:
      "The dashboard brings together a searchable timeline, evidence summaries, source links, risk pathways, and a concern ladder. Source quality and uncertainty are part of the presentation.",
  },
];

const wrap = "mx-auto w-full max-w-[1120px] px-5 sm:px-8 lg:px-10";
const sectionTitle =
  "font-display text-[1.75rem] font-bold leading-tight text-foreground sm:text-[2.125rem]";

function Index() {
  const { variant } = Route.useSearch();
  const year = new Date().getFullYear();

  if (variant) {
    return <PortfolioDesignPrototypes initialVariant={variant} />;
  }

  return (
    <div
      id="top"
      className="min-h-screen bg-background font-body text-[17px] leading-[1.6] text-foreground sm:text-lg"
    >
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to main content
      </a>

      <header className={wrap}>
        <nav
          aria-label="Primary"
          className="flex items-center justify-between border-b border-border py-4"
        >
          <a href="#top" className="font-display text-base font-bold text-foreground">
            AK
          </a>
          <ul className="flex gap-1 sm:gap-4">
            {[
              ["Work", "#work"],
              ["Contact", "#contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <a
                  href={h}
                  className="inline-flex min-h-11 items-center px-2 text-base text-muted-foreground transition-colors duration-150 hover:text-primary"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-y-10 border-b border-border py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-16">
          <div className="max-w-[720px]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              MEDICINE · EDUCATION · BIODESIGN
            </p>
            <h1 className="font-display text-[3rem] font-bold leading-[1.02] tracking-[-0.015em] text-foreground sm:text-[4.75rem]">
              Alex Krawec
            </h1>
            <div aria-hidden="true" className="mt-7 h-px w-16 bg-foreground" />
            <p className="mt-7 text-lg leading-relaxed text-foreground sm:text-xl">
              Fourth-year medical student at UCLA interested in psychiatry, medical education, and
              the design of useful clinical tools.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={CV_URL} download="Alexander_Krawec_CV.pdf" className={btnPrimary}>
                Download CV{" "}
                <span aria-hidden="true" className="ml-2">
                  ↓
                </span>
              </a>
              <a href={`mailto:${EMAIL}`} className={btnSecondary}>
                Email
              </a>
            </div>
          </div>
          <dl className="self-end border-t border-foreground text-base lg:border-t-0 lg:border-l lg:border-border lg:pl-8">
            {[
              ["PRIMARY AFFILIATION", "David Geffen School of Medicine at UCLA"],
              ["Fellowship", "UCLA–Anderson Biodesign 2026"],
              ["Founder", "Nokota MCAT Tutoring"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-border py-3 lg:first:pt-0 lg:last:border-b-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className={`${wrap} focus:outline-2 focus:outline-ring focus:outline-offset-2`}
      >
        <section id="work" aria-labelledby="work-heading" className="scroll-mt-4 py-12 sm:py-20">
          <h2 id="work-heading" className={sectionTitle}>
            Selected work
          </h2>
          <p className="mt-2 text-muted-foreground">
            Clinical tools, individualized teaching, and early-stage biodesign.
          </p>

          <div className="mt-10 space-y-6 sm:space-y-8">
            {FEATURES.map((f, i) => (
              <article
                key={f.id}
                aria-labelledby={`${f.id}-title`}
                className="grid gap-x-11 gap-y-5 rounded-[3px] border border-border bg-paper p-5 sm:p-8 lg:p-10 md:grid-cols-[55fr_45fr] md:[grid-template-areas:'img_head'_'img_body']"
              >
                <div className="min-w-0 md:[grid-area:head]">
                  <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.18em]">
                    <span className="tabular-nums text-foreground">
                      {String(i + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="h-px w-4 self-center bg-border" />
                    <span className="text-muted-foreground">{f.domain}</span>
                  </div>
                  <h3
                    id={`${f.id}-title`}
                    className="font-display text-[1.75rem] font-bold leading-tight text-foreground"
                  >
                    {f.title}
                  </h3>
                  <p className="mt-1 text-foreground">{f.subtitle}</p>
                  {f.notice && (
                    <aside
                      aria-label="System requirements"
                      className="mt-3 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"
                    >
                      <p className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-foreground/80">
                        <span
                          aria-hidden="true"
                          className="inline-flex h-4 w-4 items-center justify-center border border-primary font-display text-[0.7rem] font-bold leading-none tracking-normal text-primary"
                        >
                          !
                        </span>
                        Before you open
                      </p>
                      {f.notice.map((n) => (
                        <p key={n}>{n}</p>
                      ))}
                    </aside>
                  )}
                  <p className={`mt-1 ${meta}`}>{f.metadata}</p>
                </div>
                <figure className="min-w-0 md:[grid-area:img]">
                  <Reveal>{f.image}</Reveal>
                  {f.caption && <figcaption className={`mt-2 ${meta}`}>{f.caption}</figcaption>}
                </figure>
                <div className="min-w-0 md:[grid-area:body]">
                  <p className="text-foreground">{f.description}</p>
                  {f.extra && <p className={`mt-3 ${meta}`}>{f.extra}</p>}
                  {f.actions && (
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                      {f.actions}
                    </div>
                  )}
                  {f.details && f.detailsLabel && (
                    <Details label={f.detailsLabel}>{f.details}</Details>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="more-heading" className="border-t border-border py-12 sm:py-20">
          <h2 id="more-heading" className={sectionTitle}>
            More projects
          </h2>
          <ul className="mt-8">
            {MORE.map((p) => (
              <li
                key={p.title}
                className="grid gap-x-10 gap-y-2 border-t border-border py-6 md:grid-cols-[1fr_auto]"
              >
                <div className="max-w-[680px]">
                  <h3 className="font-display text-xl font-bold text-foreground">{p.title}</h3>
                  <p className={`mt-1 ${meta}`}>{p.status}</p>
                  <p className="mt-2 text-foreground">{p.description}</p>
                  {p.extra && <p className={`mt-1 ${meta}`}>{p.extra}</p>}
                  <Details label={`More about ${p.title}`}>{p.details}</Details>
                </div>
                <a
                  href={p.url}
                  aria-label={`${p.action}: ${p.title}`}
                  className={`${link} inline-flex min-h-11 items-start pt-1 whitespace-nowrap`}
                >
                  {p.action}{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 max-w-[680px] border-t border-border pt-8">
            <h3 className="font-display text-xl font-bold text-foreground">Development approach</h3>
            <p className="mt-2 text-muted-foreground">
              These digital prototypes use AI-assisted software implementation. My work focuses on
              the problems they address, their design, and their iteration. They remain works in
              progress; software checks should not be read as evidence of clinical validation.
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-4 bg-background">
        <div className={`${wrap} border-t border-border pt-12 pb-10 sm:pt-20 sm:pb-16`}>
          <h2 className={sectionTitle}>Contact</h2>
          <p className="mt-4 font-display text-lg text-foreground">Alex Krawec</p>
          <a href={`mailto:${EMAIL}`} className={`${link} mt-1 inline-block break-all text-lg`}>
            {EMAIL}
          </a>
          <ul className="mt-5 flex flex-wrap gap-x-6">
            <li>
              <a
                href={CV_URL}
                download="Alexander_Krawec_CV.pdf"
                className={`${link} inline-flex min-h-11 items-center`}
              >
                Download CV
              </a>
            </li>
            <li>
              <a href={GITHUB_URL} className={`${link} inline-flex min-h-11 items-center`}>
                GitHub
              </a>
            </li>
            <li>
              <a href="#top" className={`${link} inline-flex min-h-11 items-center`}>
                Back to top
              </a>
            </li>
          </ul>
          <p className={`mt-4 ${meta}`}>© {year} Alex Krawec</p>
        </div>
        <SkylineWater
          src={manhattanFooter.url}
          alt="Engraved panorama of the Lower Manhattan skyline and Brooklyn Bridge"
          ferry={false}
          className="w-full"
        />
      </footer>
    </div>
  );
}
