import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

import cvAsset from "@/assets/alexander-krawec-cv.pdf.asset.json";
import clinicalShot from "@/assets/clinical-timeline-preview.webp.asset.json";
import clinicalVideo from "@/assets/clinical-timeline-preview.mp4.asset.json";
import clinicalWebm from "@/assets/clinical-timeline-preview.webm.asset.json";
import edShot from "@/assets/ed-throughput-preview.webp.asset.json";
import edVideo from "@/assets/ed-throughput-preview.mp4.asset.json";
import edWebm from "@/assets/ed-throughput-preview.webm.asset.json";
import limbwatchAsset from "@/assets/limbwatch.png.asset.json";
import manhattanFooter from "@/assets/manhattan-footer.png.asset.json";
import nmatlasShot from "@/assets/nmatlas-poster.webp.asset.json";
import nmatlasVideo from "@/assets/nmatlas-preview.mp4.asset.json";
import nmatlasWebm from "@/assets/nmatlas-preview.webm.asset.json";
import responsemapShot from "@/assets/responsemap-preview.webp.asset.json";
import responsemapVideo from "@/assets/responsemap-preview.mp4.asset.json";
import responsemapWebm from "@/assets/responsemap-preview.webm.asset.json";
import SkylineWater from "@/components/SkylineWater";

import "./index.css";

const TITLE = "Alex Krawec — Medicine, Education & Design";
const DESCRIPTION =
  "Alex Krawec is a UCLA medical student interested in psychiatry, medical education, and biodesign. Explore selected projects, teaching work, and his CV.";

export const Route = createFileRoute("/")({
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
      { property: "og:image", content: manhattanFooter.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://alexkrawec.com/" }],
  }),
  component: Index,
});

const CV_URL = cvAsset.url;
const EMAIL = "KrawecERAS@Gmail.com";
const GITHUB_URL = "https://github.com/ALEXKDOT";
const HERO_IMAGE_URL = "assets/bow-bridge-blue-line.jpg";
const NOKOTA_HORSE_URL = "assets/nokota-horse.png";
const NMATLAS_URL =
  "https://alexkdot.github.io/NMAtlas/?v=0.17.0#topic=tms-depression&target=dlpfc&map=off&regions=&regionOpacity=0.16&hemisphere=both&view=free&cortex=0.065&mapOpacity=0.28&labels=false&bundles=CS_A&tractMode=suggested&panel=targets";

type MediaKey = "nmatlas" | "responsemap" | "clinical-timeline" | "ed-throughput" | "limbwatch";

type Feature = {
  id: string;
  media: MediaKey;
  title: string;
  subtitle: string;
  domain: string;
  metadata?: string;
  caption?: string;
  description: string;
  action?: string;
  url?: string;
  detailsLabel: string;
  details: string;
  notice?: string[];
  tone: "paper" | "sky" | "blue" | "sand" | "sage";
};

const FEATURES: Feature[] = [
  {
    id: "nmatlas",
    media: "nmatlas",
    title: "NMAtlas",
    subtitle: "Atlas of neuromodulation targets",
    domain: "NEUROMODULATION · EDUCATION",
    notice: ["8 GB RAM minimum · 16 GB suggested", "May not run on hospital computers"],
    description:
      "An interactive, 3D neuroanatomy atlas of neuromodulation targets and protocols, with references to underlying research findings.",
    action: "Open NMAtlas demo",
    url: NMATLAS_URL,
    detailsLabel: "More about NMAtlas",
    details:
      "This application is an evidence-backed 3D atlas of brain tracts and gross anatomy relevant to neuromodulation treatments. It draws on published tractography data, fMRI, and other functional imaging research. It includes a guided educational component for graduate medical students.",
    tone: "paper",
  },
  {
    id: "responsemap",
    media: "responsemap",
    title: "ResponseMap",
    subtitle: "ADHD symptom and medication journal",
    domain: "Psychiatry · Patient tools",
    description:
      "A journal prototype for recording symptoms, context, and medication timing throughout the day. It brings those observations into a shared visual timeline to support more structured conversations between patients and clinicians.",
    action: "Open ResponseMap demo",
    url: "https://alexkdot.github.io/psych-med-visualizer/",
    detailsLabel: "More about ResponseMap",
    details:
      "The design question is how to make experiences between appointments easier to record and discuss. The prototype includes manual check-ins, selectable variables, medication-event markers, and review views. Entries remain only in the open session and clear when the page is reloaded or closed. The current version does not include saved records or provider sharing, and it does not establish medication effects or recommend treatment changes.",
    tone: "sky",
  },
  {
    id: "clinical-timeline",
    media: "clinical-timeline",
    title: "Clinical Timeline",
    subtitle: "A visual chronology of patient records",
    domain: "Clinical informatics",
    description:
      "A visual chronology of encounters, messages, care transitions, and medication history, exploring how fragmented records could become easier to review.",
    action: "Open Clinical Timeline demo",
    url: "https://alexkdot.github.io/ehr-timeline-view/",
    detailsLabel: "More about Clinical Timeline",
    details:
      "The current demonstration uses fictional information. It is not a live EHR connection, a complete medical chart, or an automated record-import system.",
    tone: "sand",
  },
  {
    id: "ed-throughput",
    media: "ed-throughput",
    title: "ED Throughput Sandbox",
    subtitle: "Emergency department flow simulation",
    domain: "HEALTH SYSTEMS IMPROVEMENT",
    description:
      "An educational simulation for exploring how arrivals, treatment capacity, diagnostic queues, and boarding assumptions affect synthetic patient flow.",
    action: "Open ED Throughput demo",
    url: "https://alexkdot.github.io/ed-throughput-sandbox/#visualizer",
    detailsLabel: "More about ED Throughput Sandbox",
    details:
      "The project supports scenario comparisons and replay of a representative synthetic week. Its assumptions have not been calibrated to a particular hospital; it is an exploratory model, not a validated operational forecasting tool.",
    tone: "blue",
  },
  {
    id: "limbwatch",
    media: "limbwatch",
    title: "LimbWatch",
    subtitle: "Wearable perfusion-monitoring concept",
    domain: "Biodesign · Medical device",
    metadata: "UCLA–Anderson Biodesign · Device prototype",
    caption: "Concept illustration; development is ongoing.",
    description:
      "Through the UCLA–Anderson Biodesign Fellowship, I began developing a wearable sensor concept to explore more consistent tracking of lower-extremity perfusion. The project grew from the burden of repeated bedside pulse assessments and remains in early development.",
    detailsLabel: "More about LimbWatch",
    details:
      "The concept uses photoplethysmography, or PPG, to explore quantitative monitoring over time. The broader biodesign work considered clinical workflows, stakeholder needs, adoption barriers, and feasibility. It remains a prototype rather than a validated clinical device.",
    tone: "sage",
  },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function ProjectVideo({
  poster,
  mp4,
  webm,
  label,
}: {
  poster: string;
  mp4: string;
  webm: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (failed || reducedMotion) {
    return <img src={poster} alt={label} loading="lazy" />;
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      onError={() => setFailed(true)}
    >
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}

function ProjectMedia({ feature }: { feature: Feature }) {
  let media: ReactNode;

  if (feature.media === "nmatlas") {
    media = (
      <ProjectVideo
        poster={nmatlasShot.url}
        mp4={nmatlasVideo.url}
        webm={nmatlasWebm.url}
        label="NMAtlas research atlas showing a translucent 3D brain, fiber tracts, target markers, and a research sidebar."
      />
    );
  } else if (feature.media === "responsemap") {
    media = (
      <ProjectVideo
        poster={responsemapShot.url}
        mp4={responsemapVideo.url}
        webm={responsemapWebm.url}
        label="ResponseMap daily journal showing symptom ratings, a note field, and a 24-hour chart."
      />
    );
  } else if (feature.media === "clinical-timeline") {
    media = (
      <ProjectVideo
        poster={clinicalShot.url}
        mp4={clinicalVideo.url}
        webm={clinicalWebm.url}
        label="Clinical Timeline showing a record activity scrubber and rows for events across several months."
      />
    );
  } else if (feature.media === "ed-throughput") {
    media = (
      <ProjectVideo
        poster={edShot.url}
        mp4={edVideo.url}
        webm={edWebm.url}
        label="Emergency department simulation showing patient markers moving through care areas."
      />
    );
  } else {
    media = (
      <img
        src={limbwatchAsset.url}
        alt="LimbWatch concept illustration showing sensor patches on a foot connected to a small monitor."
        width={668}
        height={668}
        loading="lazy"
      />
    );
  }

  const frame = <div className={`ex-media-frame ex-media-frame--${feature.media}`}>{media}</div>;

  if (!feature.url) return frame;

  return (
    <a className="ex-media-link" href={feature.url} aria-label={feature.action}>
      {frame}
    </a>
  );
}

function Reveal({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ex-reveal ${className}`} {...props}>
      {children}
    </div>
  );
}

function Details({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="ex-details">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <span className="ex-details-mark" aria-hidden="true">
          +
        </span>
      </button>
      <div id={id} className="ex-details-content" data-open={open} inert={!open}>
        <div>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectChapter({ feature, index }: { feature: Feature; index: number }) {
  const number = String(index + 1).padStart(2, "0");
  const total = String(FEATURES.length).padStart(2, "0");
  const headingId = `${feature.id}-title`;

  return (
    <section
      id={index === 0 ? "work" : feature.id}
      className={`ex-chapter ex-chapter--${feature.tone}`}
      aria-labelledby={headingId}
    >
      <div className="ex-wrap wrap ex-project-layout">
        <Reveal className="ex-project-copy">
          {index === 0 && (
            <div className="ex-section-heading">
              <h2>Selected work</h2>
              <p>Clinical tools, individualized teaching, and early-stage biodesign.</p>
            </div>
          )}
          <p className="ex-project-meta">
            <span>
              {number} / {total}
            </span>
            <span>{feature.domain}</span>
          </p>
          <h3 id={headingId}>{feature.title}</h3>
          <p className="ex-project-subtitle">{feature.subtitle}</p>
          {feature.metadata && <p className="ex-project-note">{feature.metadata}</p>}
          {feature.caption && <p className="ex-project-note">{feature.caption}</p>}
          {feature.notice && (
            <aside className="ex-requirements" aria-label="System requirements">
              <p>Before you open</p>
              {feature.notice.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </aside>
          )}
          <p className="ex-project-description">{feature.description}</p>
          {feature.action && feature.url && (
            <a className="ex-button" href={feature.url}>
              <span>{feature.action}</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <Details label={feature.detailsLabel}>{feature.details}</Details>
        </Reveal>

        <Reveal className="ex-project-visual">
          <figure>
            <ProjectMedia feature={feature} />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function SignalEngraving() {
  return (
    <svg
      className="ex-storybook-engraving ex-storybook-engraving--signal"
      viewBox="0 0 640 640"
      aria-hidden="true"
    >
      <path className="ex-engraving-frame" d="M42 74 Q320 18 598 74V566Q320 622 42 566Z" />
      <path d="M96 478 Q184 438 270 472T448 466T566 474" />
      <path d="M82 500 Q176 462 270 494T458 490T580 498" />
      <circle cx="320" cy="294" r="156" />
      <circle cx="320" cy="294" r="112" />
      <path d="m320 120 28 146 132 28-132 28-28 146-28-146-132-28 132-28Z" />
      <circle cx="320" cy="294" r="18" />
      <path d="m126 164 7 16 16 7-16 7-7 16-7-16-16-7 16-7Zm386 58 5 12 12 5-12 5-5 12-5-12-12-5 12-5ZM150 370l5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" />
      <path
        className="ex-engraving-hatch"
        d="M178 234l44-58m-28 104 72-96m-54 148 86-114m52 164 88-116m-42 154 70-92"
      />
    </svg>
  );
}

function ApproachEngraving() {
  return (
    <svg
      className="ex-storybook-engraving ex-storybook-engraving--approach"
      viewBox="0 0 640 640"
      aria-hidden="true"
    >
      <path className="ex-engraving-frame" d="M48 82 Q320 24 592 82V558Q320 616 48 558Z" />
      <circle cx="320" cy="220" r="72" />
      <path d="M320 98v34m0 176v34M198 220h34m176 0h34m-208-86 24 24m124 124 24 24m0-172-24 24M258 282l-24 24" />
      <path d="M106 456 Q184 408 270 444T448 438T566 450" />
      <path d="M92 482 Q190 438 284 470T472 466T582 478" />
      <path d="M148 536q82-58 166-30 84-28 178 30V368q-94-56-178-22-84-34-166 22Z" />
      <path d="M314 346v160M174 390q70-38 140-14m152 14q-76-38-152-14M182 424q66-34 132-12m144 12q-72-34-144-12" />
      <path className="ex-engraving-hatch" d="m180 516 28-44m8 54 36-54m176 44-28-44m-8 54-36-54" />
    </svg>
  );
}

function Index() {
  return (
    <div className="ex-site" id="top">
      <a className="ex-skip" href="#main">
        Skip to main content
      </a>

      <header className="ex-nav nav" role="banner">
        <div className="ex-wrap wrap ex-nav-inner">
          <a className="ex-brand" href="#top" aria-label="Alex Krawec">
            AK
          </a>
          <nav aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="ex-nav-cv" href={CV_URL} download="Alexander_Krawec_CV.pdf">
            Download CV
          </a>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="ex-hero" aria-labelledby="hero-title">
          <img
            className="ex-hero-engraving layer"
            src={HERO_IMAGE_URL}
            alt=""
            width={1800}
            height={1260}
            aria-hidden="true"
            fetchPriority="high"
          />
          <div className="ex-wrap wrap ex-hero-inner">
            <div className="ex-hero-copy hero-text">
              <p className="ex-kicker">MEDICINE · EDUCATION · BIODESIGN</p>
              <h1 id="hero-title">Alex Krawec</h1>
              <p className="ex-hero-lead">
                Fourth-year medical student at UCLA interested in psychiatry, medical education, and
                the design of useful clinical tools.
              </p>
              <div className="ex-hero-actions">
                <a className="ex-button" href={CV_URL} download="Alexander_Krawec_CV.pdf">
                  <span>Download CV</span>
                  <span aria-hidden="true">↓</span>
                </a>
                <a className="ex-button ex-button--secondary" href={`mailto:${EMAIL}`}>
                  Email
                </a>
              </div>
            </div>

            <div className="ex-hero-facts">
              <div>
                <p className="ex-hero-fact-label">PRIMARY AFFILIATION</p>
                <p className="ex-hero-fact-value">David Geffen School of Medicine at UCLA</p>
              </div>
              <div>
                <p className="ex-hero-fact-label">Fellowship</p>
                <p className="ex-hero-fact-value">UCLA–Anderson Biodesign 2026</p>
              </div>
              <div>
                <p className="ex-hero-fact-label">Founder</p>
                <p className="ex-hero-fact-value">Nokota MCAT Tutoring</p>
              </div>
            </div>
          </div>
        </section>

        {FEATURES.map((feature, index) => (
          <ProjectChapter key={feature.id} feature={feature} index={index} />
        ))}

        <section className="ex-chapter ex-chapter--paper ex-more" aria-labelledby="nokota-title">
          <div className="ex-wrap wrap ex-more-layout">
            <Reveal className="ex-more-copy">
              <div className="ex-section-heading">
                <h2>More projects</h2>
              </div>
              <p className="ex-project-note">Founder and Lead Instructor</p>
              <h3 id="nokota-title">Nokota MCAT Tutoring</h3>
              <p className="ex-project-description">
                I founded Nokota to support learners whose needs are poorly served by standard
                preparation plans. The program now offers free MCAT tutoring and premedical advising
                to accepted participants who are neurodivergent, financially under-resourced, or
                both, with study plans and materials shaped around each learner&apos;s barriers.
              </p>
              <p className="ex-project-note">
                25+ learners supported · 250+ hours of tutoring and advising
              </p>
              <a className="ex-button" href="https://nokotamcat.com/">
                <span>Visit Nokota</span>
                <span aria-hidden="true">↗</span>
              </a>
              <Details label="More about Nokota MCAT Tutoring">
                My work includes individualized study planning, curriculum and practice-material
                development, tutoring, and advising. The program grew from gaps I encountered while
                working in commercial test preparation. Its emphasis is on adapting the preparation
                process to the learner&apos;s cognitive, academic, and practical constraints.
              </Details>
            </Reveal>
            <Reveal className="ex-more-visual ex-more-visual--horse">
              <a href="https://nokotamcat.com/" aria-label="Visit Nokota">
                <img
                  src={NOKOTA_HORSE_URL}
                  alt="Nokota horse illustration"
                  width={1518}
                  height={892}
                  loading="lazy"
                />
              </a>
            </Reveal>
          </div>
        </section>

        <section className="ex-chapter ex-chapter--sky ex-more" aria-labelledby="frontier-title">
          <div className="ex-wrap wrap ex-more-layout">
            <Reveal className="ex-more-copy">
              <p className="ex-project-note">Research dashboard</p>
              <h3 id="frontier-title">Frontier Signal</h3>
              <p className="ex-project-description">
                A source-linked dashboard for exploring frontier AI incidents, capabilities,
                safeguards, and governance, with explanations intended to make the evidence easier
                to assess.
              </p>
              <a className="ex-button" href="https://alexkdot.github.io/frontier-signal/">
                <span>Explore dashboard</span>
                <span aria-hidden="true">↗</span>
              </a>
              <Details label="More about Frontier Signal">
                The dashboard brings together a searchable timeline, evidence summaries, source
                links, risk pathways, and a concern ladder. Source quality and uncertainty are part
                of the presentation.
              </Details>
            </Reveal>
            <Reveal
              className="ex-signal-illustration frame"
              role="img"
              aria-label="Frontier Signal"
            >
              <SignalEngraving />
            </Reveal>
          </div>
        </section>

        <section className="ex-approach" aria-labelledby="approach-title">
          <div className="ex-wrap wrap ex-approach-inner">
            <div className="ex-approach-copy">
              <h2 id="approach-title">Development approach</h2>
              <p>
                These digital prototypes use AI-assisted software implementation. My work focuses on
                the problems they address, their design, and their iteration. They remain works in
                progress; software checks should not be read as evidence of clinical validation.
              </p>
            </div>
            <div
              className="ex-approach-illustration frame"
              role="img"
              aria-label="Development approach"
            >
              <ApproachEngraving />
            </div>
          </div>
        </section>
      </main>

      <footer className="ex-footer closing" id="contact">
        <div className="ex-wrap wrap ex-contact">
          <h2>Contact</h2>
          <p>Alex Krawec</p>
          <a className="ex-email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <nav aria-label="Contact">
            <a href={CV_URL} download="Alexander_Krawec_CV.pdf">
              Download CV
            </a>
            <a href={GITHUB_URL}>GitHub</a>
            <a href="#top">Back to top</a>
          </nav>
          <p className="ex-copyright">© {new Date().getFullYear()} Alex Krawec</p>
        </div>
        <SkylineWater
          src={manhattanFooter.url}
          alt="Engraved panorama of the Lower Manhattan skyline and Brooklyn Bridge"
          ferry={false}
          className="ex-skyline"
        />
      </footer>
    </div>
  );
}
