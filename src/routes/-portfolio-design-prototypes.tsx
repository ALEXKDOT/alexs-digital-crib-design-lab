import { useEffect, useRef, useState } from "react";

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

import "./-portfolio-design-prototypes.css";

/**
 * THROWAWAY DESIGN PROTOTYPE
 * Kind: service — a personal portfolio of clinical, education, and biodesign work.
 * Main action: Email Alex.
 * A / Journal: split hero, nav-split, footer-visit, close-photo, space, arrow, ring.
 * B / Instrument: split hero, nav-split, footer-dark, close-type, surface-pairs, solid, stack.
 * C / Exhibition: split hero, nav-centre, footer-visit, close-photo, dark-band, block, wordmark.
 * Each direction reuses the same real work. No content or design here is the chosen production UI.
 */

export type PrototypeVariant = "A" | "B" | "C";
type ProjectId = "nmatlas" | "responsemap" | "clinical" | "ed" | "limbwatch";

type Project = {
  id: ProjectId;
  number: string;
  title: string;
  shortTitle: string;
  domain: string;
  subtitle: string;
  description: string;
  href?: string;
  poster: string;
  mp4?: string;
  webm?: string;
  alt: string;
};

const EMAIL = "KrawecERAS@Gmail.com";
const GITHUB_URL = "https://github.com/ALEXKDOT";
const NMATLAS_URL =
  "https://alexkdot.github.io/NMAtlas/?v=0.17.0#topic=tms-depression&target=dlpfc&map=off&regions=&regionOpacity=0.16&hemisphere=both&view=free&cortex=0.065&mapOpacity=0.28&labels=false&bundles=CS_A&tractMode=suggested&panel=targets";

const PROJECTS: Project[] = [
  {
    id: "nmatlas",
    number: "01",
    title: "NMAtlas",
    shortTitle: "NMAtlas",
    domain: "Neuromodulation · Education",
    subtitle: "Atlas of neuromodulation targets",
    description:
      "An interactive 3D neuroanatomy atlas of neuromodulation targets and protocols, grounded in published research.",
    href: NMATLAS_URL,
    poster: nmatlasShot.url,
    mp4: nmatlasVideo.url,
    webm: nmatlasWebm.url,
    alt: "NMAtlas showing a translucent 3D brain, fiber tracts, target markers, and a research sidebar.",
  },
  {
    id: "responsemap",
    number: "02",
    title: "ResponseMap",
    shortTitle: "ResponseMap",
    domain: "Psychiatry · Patient tools",
    subtitle: "ADHD symptom and medication journal",
    description:
      "A journal prototype that brings symptoms, context, and medication timing into a shared visual timeline.",
    href: "https://alexkdot.github.io/psych-med-visualizer/",
    poster: responsemapShot.url,
    mp4: responsemapVideo.url,
    webm: responsemapWebm.url,
    alt: "ResponseMap daily journal with symptom ratings, a note field, and a 24-hour chart.",
  },
  {
    id: "clinical",
    number: "03",
    title: "Clinical Timeline",
    shortTitle: "Timeline",
    domain: "Clinical informatics",
    subtitle: "A visual chronology of patient records",
    description:
      "A visual chronology of encounters, messages, care transitions, and medication history for faster review.",
    href: "https://alexkdot.github.io/ehr-timeline-view/",
    poster: clinicalShot.url,
    mp4: clinicalVideo.url,
    webm: clinicalWebm.url,
    alt: "Clinical Timeline with a record activity scrubber and rows for events across several months.",
  },
  {
    id: "ed",
    number: "04",
    title: "ED Throughput Sandbox",
    shortTitle: "ED Sandbox",
    domain: "Health systems improvement",
    subtitle: "Emergency department flow simulation",
    description:
      "An educational simulation for exploring how capacity, diagnostic queues, and boarding assumptions affect synthetic patient flow.",
    href: "https://alexkdot.github.io/ed-throughput-sandbox/#visualizer",
    poster: edShot.url,
    mp4: edVideo.url,
    webm: edWebm.url,
    alt: "Emergency department simulation with patient markers moving through care areas.",
  },
  {
    id: "limbwatch",
    number: "05",
    title: "LimbWatch",
    shortTitle: "LimbWatch",
    domain: "Biodesign · Medical device",
    subtitle: "Wearable perfusion-monitoring concept",
    description:
      "An early wearable-sensor concept exploring more consistent tracking of lower-extremity perfusion.",
    poster: limbwatchAsset.url,
    alt: "LimbWatch concept showing sensor patches on a foot connected to a small monitor.",
  },
];

const project = (id: ProjectId) => PROJECTS.find((item) => item.id === id)!;

function ProjectMedia({
  item,
  className = "",
  eager = false,
}: {
  item: Project;
  className?: string;
  eager?: boolean;
}) {
  const visual = item.mp4 ? (
    <video
      className="dp-media-content"
      poster={item.poster}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? "auto" : "metadata"}
      aria-label={item.alt}
      data-source="client"
      data-subject={item.id}
    >
      {item.webm && <source src={item.webm} type="video/webm" />}
      <source src={item.mp4} type="video/mp4" />
    </video>
  ) : (
    <img
      className="dp-media-content dp-media-contain"
      src={item.poster}
      alt={item.alt}
      loading={eager ? "eager" : "lazy"}
      data-source="client"
      data-subject={item.id}
    />
  );

  return item.href ? (
    <a className={`dp-media ${className}`} href={item.href} aria-label={`Open ${item.title}`}>
      {visual}
    </a>
  ) : (
    <div className={`dp-media ${className}`}>{visual}</div>
  );
}

function ArrowLink({ href, children }: { href: string; children: string }) {
  return (
    <a className="dp-arrow-link" href={href}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function PictureDevelops({ item }: { item: Project }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset["momentMounted"] = "1";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.classList.add("is-done");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.classList.add("is-done");
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="dp-a-ed" data-moment="picture-develops">
      <ProjectMedia item={item} />
    </div>
  );
}

function JournalDesign() {
  const nmatlas = project("nmatlas");
  const responsemap = project("responsemap");
  const clinical = project("clinical");
  const ed = project("ed");
  const limbwatch = project("limbwatch");

  return (
    <>
      <header className="dp dp-journal dp-nav nav" id="top">
        <a className="dp-skip" href="#main-a">
          Skip to work
        </a>
        <div className="dp-wrap wrap dp-nav-inner dp-nav-split">
          <div className="dp-nav-links">
            <a href="#work-a">Selected work</a>
            <a href="#approach-a">Approach</a>
          </div>
          <a className="dp-brand" href="#top" aria-label="Alex Krawec, home">
            <span className="dp-ring" aria-hidden="true" />
            Alex Krawec
          </a>
          <a className="dp-nav-action" href={`mailto:${EMAIL}`}>
            Email Alex <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main className="dp dp-journal" id="main-a">
        <section className="dp-screen dp-a-hero">
          <div className="dp-wrap wrap dp-a-hero-grid">
            <div className="dp-hero-copy hero-text">
              <p className="dp-kicker">Medicine · Education · Design</p>
              <h1>Clinical tools, made easier to see.</h1>
              <p className="dp-lead">
                I’m Alex Krawec, a fourth-year UCLA medical student building educational and
                clinical tools at the edge of psychiatry, systems improvement, and biodesign.
              </p>
              <div className="dp-actions">
                <a className="dp-button dp-button-arrow" href={`mailto:${EMAIL}`}>
                  Email Alex <span aria-hidden="true">↗</span>
                </a>
                <a className="dp-text-link" href={cvAsset.url} download="Alexander_Krawec_CV.pdf">
                  Download CV ↓
                </a>
              </div>
            </div>
            <div className="dp-a-hero-visual">
              <ProjectMedia item={nmatlas} eager />
              <div className="dp-fact-card">
                <span>Current study</span>
                <strong>Neuromodulation, mapped in 3D</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dp-screen dp-a-work" id="work-a" aria-labelledby="work-a-title">
          <div className="dp-wrap wrap">
            <div className="dp-section-head">
              <div>
                <p className="dp-kicker">Selected work · 01—05</p>
                <h2 id="work-a-title">Symptom journals and record timelines.</h2>
              </div>
              <p>
                Each project starts with a practical question: what would make this information
                easier to record, review, teach, or discuss?
              </p>
            </div>
            <div className="dp-a-pair">
              {[responsemap, clinical].map((item) => (
                <article className="dp-a-project" key={item.id}>
                  <ProjectMedia item={item} />
                  <div className="dp-project-line">
                    <div>
                      <p>
                        {item.number} · {item.title} · {item.domain}
                      </p>
                      <h3>
                        {item.id === "responsemap"
                          ? "A daily symptom journal"
                          : "A visual record timeline"}
                      </h3>
                    </div>
                    {item.href && <ArrowLink href={item.href}>Open prototype</ArrowLink>}
                  </div>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="dp-screen dp-a-approach"
          id="approach-a"
          aria-labelledby="approach-a-title"
        >
          <div className="dp-wrap wrap dp-a-approach-grid">
            <div className="dp-a-approach-copy">
              <p className="dp-kicker">Systems, then screens</p>
              <h2 id="approach-a-title">Clinical tool design is part of the investigation.</h2>
              <p>
                The work moves from workflow and stakeholder needs into testable interfaces,
                simulations, and educational models. The artifacts are prototypes—not clinical
                claims—and they improve through use, critique, and iteration.
              </p>
              <div className="dp-a-device">
                <ProjectMedia item={limbwatch} />
                <div>
                  <span>05 · Biodesign</span>
                  <strong>LimbWatch</strong>
                  <p>Exploring a more consistent view of lower-extremity perfusion.</p>
                </div>
              </div>
              <div className="dp-a-approach-actions">
                <a className="dp-button dp-button-arrow" href={`mailto:${EMAIL}`}>
                  Email Alex <span aria-hidden="true">↗</span>
                </a>
                <ArrowLink href={ed.href!}>Explore the ED simulation</ArrowLink>
              </div>
            </div>
            <PictureDevelops item={ed} />
          </div>
        </section>
      </main>

      <footer className="dp dp-journal dp-a-footer closing" id="contact-a">
        <div className="dp-wrap wrap dp-a-footer-wrap">
          <div className="dp-a-footer-grid">
            <div>
              <p className="dp-kicker">Contact</p>
              <h2>Have a problem worth making visible?</h2>
              <a className="dp-button dp-button-arrow" href={`mailto:${EMAIL}`}>
                Email Alex <span aria-hidden="true">↗</span>
              </a>
            </div>
            <img
              src={manhattanFooter.url}
              alt="Engraved panorama of Lower Manhattan and the Brooklyn Bridge"
              loading="lazy"
              data-source="client"
              data-subject="New York skyline"
            />
          </div>
          <div className="dp-footer-meta">
            <span>Alex Krawec · UCLA Medicine</span>
            <a href={GITHUB_URL}>GitHub ↗</a>
            <a href={cvAsset.url} download="Alexander_Krawec_CV.pdf">
              CV ↓
            </a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </>
  );
}

function InstrumentDesign() {
  const [activeId, setActiveId] = useState<ProjectId>("nmatlas");
  const active = project(activeId);
  const ed = project("ed");
  const limbwatch = project("limbwatch");

  return (
    <article className="dp dp-instrument" id="top">
      <a className="dp-skip" href="#main-b">
        Skip to work
      </a>
      <header className="dp-nav nav">
        <div className="dp-wrap wrap dp-nav-inner dp-nav-split">
          <div className="dp-nav-links">
            <a href="#work-b">Case index</a>
            <a href="#method-b">Method</a>
          </div>
          <a className="dp-brand" href="#top">
            <span className="dp-stack-mark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Alex Krawec
          </a>
          <a className="dp-nav-action dp-solid-action" href={`mailto:${EMAIL}`}>
            Email Alex
          </a>
        </div>
      </header>

      <main id="main-b">
        <section className="dp-screen dp-b-hero">
          <div className="dp-wrap wrap dp-b-hero-grid">
            <div className="dp-b-title">
              <p className="dp-kicker">Portfolio / 2026</p>
              <h1>Better views of complex care.</h1>
              <p className="dp-lead">
                Clinical tools and teaching projects by Alex Krawec, a fourth-year UCLA medical
                student working across psychiatry, informatics, and biodesign.
              </p>
              <a className="dp-button dp-button-solid" href={`mailto:${EMAIL}`}>
                Email Alex
              </a>
            </div>
            <div className="dp-b-hero-console">
              <div className="dp-console-bar">
                <span>System study 04</span>
                <span className="dp-live">
                  <i /> Simulation running
                </span>
              </div>
              <ProjectMedia item={ed} eager />
              <div className="dp-console-readout">
                <span>Arrivals</span>
                <strong>Synthetic</strong>
                <span>Model</span>
                <strong>Educational</strong>
                <span>Focus</span>
                <strong>Patient flow</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="dp-screen dp-b-work" id="work-b" aria-labelledby="work-b-title">
          <div className="dp-wrap wrap">
            <div className="dp-section-head dp-b-section-head">
              <div>
                <p className="dp-kicker">Case index / Choose a view</p>
                <h2 id="work-b-title">Four working prototypes.</h2>
              </div>
              <p>The selected project is visible at full scale. Choose any row to inspect it.</p>
            </div>
            <div className="dp-b-selector">
              <div className="dp-b-project-list" aria-label="Project selector">
                {PROJECTS.filter((item) => item.id !== "limbwatch").map((item) => (
                  <button
                    type="button"
                    className="dp-b-project-row"
                    data-active={activeId === item.id}
                    aria-pressed={activeId === item.id}
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span>{item.number}</span>
                    <strong>{item.shortTitle}</strong>
                    <i aria-hidden="true">→</i>
                  </button>
                ))}
              </div>
              <div className="dp-b-active">
                <ProjectMedia item={active} />
                <div className="dp-b-active-copy">
                  <div>
                    <p>{active.domain}</p>
                    <h3>{active.title}</h3>
                    <span>{active.subtitle}</span>
                  </div>
                  <p>{active.description}</p>
                  {active.href && <ArrowLink href={active.href}>Open live project</ArrowLink>}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dp-screen dp-b-method" id="method-b" aria-labelledby="method-b-title">
          <div className="dp-wrap wrap dp-b-method-grid">
            <div className="dp-b-method-copy">
              <p className="dp-kicker">Method / 01—03</p>
              <h2 id="method-b-title">Observe. Model. Make.</h2>
              <ol>
                <li>
                  <span>01</span>
                  <strong>Find the friction</strong>
                  <p>Start with the workflow, learner, and decision—not the interface.</p>
                </li>
                <li>
                  <span>02</span>
                  <strong>Make it inspectable</strong>
                  <p>Turn assumptions into a map, model, or prototype people can question.</p>
                </li>
                <li>
                  <span>03</span>
                  <strong>Learn in public</strong>
                  <p>Use feedback and evidence to sharpen the problem and the next iteration.</p>
                </li>
              </ol>
            </div>
            <div className="dp-b-device">
              <ProjectMedia item={limbwatch} />
              <div>
                <span>DEVICE CONCEPT / 05</span>
                <h3>LimbWatch</h3>
                <p>{limbwatch.description}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="dp-b-footer closing">
        <div className="dp-wrap wrap dp-b-close">
          <div>
            <p className="dp-kicker">Next conversation</p>
            <h2>What should be easier to understand?</h2>
          </div>
          <a className="dp-button dp-button-solid dp-button-light" href={`mailto:${EMAIL}`}>
            Email Alex
          </a>
        </div>
        <div className="dp-wrap wrap dp-footer-meta">
          <span>Alex Krawec · Medicine, education, biodesign</span>
          <a href={GITHUB_URL}>GitHub ↗</a>
          <a href={cvAsset.url} download="Alexander_Krawec_CV.pdf">
            CV ↓
          </a>
          <a href="#top">Top ↑</a>
        </div>
      </footer>
    </article>
  );
}

function ExhibitionDesign() {
  const nmatlas = project("nmatlas");
  const responsemap = project("responsemap");
  const clinical = project("clinical");
  const ed = project("ed");

  return (
    <article className="dp dp-exhibition" id="top">
      <a className="dp-skip" href="#main-c">
        Skip to work
      </a>
      <header className="dp-nav nav">
        <div className="dp-wrap wrap dp-nav-inner dp-nav-centre">
          <a className="dp-brand dp-wordmark" href="#top">
            ALEX K.
          </a>
          <div className="dp-nav-links">
            <a href="#gallery-c">Work</a>
            <a href="#about-c">About</a>
            <a href={`mailto:${EMAIL}`}>Contact</a>
          </div>
          <a
            className="dp-nav-action dp-block-action"
            href={cvAsset.url}
            download="Alexander_Krawec_CV.pdf"
          >
            CV ↓
          </a>
        </div>
      </header>

      <main id="main-c">
        <section className="dp-screen dp-c-hero">
          <div className="dp-wrap wrap dp-c-hero-copy">
            <p className="dp-kicker">Alex Krawec · Medicine / Education / Biodesign</p>
            <h1>Make the invisible work visible.</h1>
            <p>
              Interfaces and learning tools for the moments when clinical information becomes a
              decision, a conversation, or a new question.
            </p>
          </div>
          <div className="dp-c-hero-media">
            <ProjectMedia item={nmatlas} eager />
            <div className="dp-c-media-index">
              <span>01 / 05</span>
              <strong>NMAtlas</strong>
              <a href={nmatlas.href}>Enter atlas ↗</a>
            </div>
          </div>
        </section>

        <section className="dp-screen dp-c-dark" id="gallery-c" aria-labelledby="gallery-c-title">
          <div className="dp-wrap wrap dp-c-dark-grid">
            <div className="dp-c-dark-copy">
              <p className="dp-kicker">System study / 04</p>
              <h2 id="gallery-c-title">A hospital flow model you can watch.</h2>
              <p>{ed.description}</p>
              <ArrowLink href={ed.href!}>Run the simulation</ArrowLink>
            </div>
            <ProjectMedia item={ed} />
          </div>
          <div className="dp-wrap wrap dp-c-project-rail">
            {PROJECTS.map((item) => (
              <a href={item.href ?? "#about-c"} key={item.id}>
                <span>{item.number}</span>
                {item.shortTitle}
              </a>
            ))}
          </div>
        </section>

        <section className="dp-screen dp-c-pair" id="about-c" aria-labelledby="about-c-title">
          <div className="dp-wrap wrap">
            <div className="dp-section-head">
              <div>
                <p className="dp-kicker">Two records / two time scales</p>
                <h2 id="about-c-title">Designing time so people can use it.</h2>
              </div>
              <p>
                ResponseMap follows a day. Clinical Timeline follows a chart. Both explore how a
                visual chronology can support a better conversation.
              </p>
            </div>
            <div className="dp-c-pair-grid">
              <article>
                <ProjectMedia item={responsemap} />
                <div>
                  <span>02</span>
                  <h3>One day</h3>
                  <p>Symptoms, medication, and context in one view.</p>
                </div>
              </article>
              <article>
                <ProjectMedia item={clinical} />
                <div>
                  <span>03</span>
                  <h3>One record</h3>
                  <p>Encounters, messages, transitions, and treatment over time.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="dp-c-footer closing">
        <div className="dp-wrap wrap dp-c-close">
          <div>
            <p className="dp-kicker">Alex Krawec</p>
            <h2>Medicine needs more useful ways of seeing.</h2>
            <a className="dp-button dp-button-block" href={`mailto:${EMAIL}`}>
              Email Alex ↗
            </a>
          </div>
          <img
            src={manhattanFooter.url}
            alt="Engraved panorama of Lower Manhattan and the Brooklyn Bridge"
            loading="lazy"
            data-source="client"
            data-subject="New York skyline"
          />
        </div>
        <div className="dp-wrap wrap dp-footer-meta">
          <span>Fourth-year medical student · UCLA</span>
          <a href={GITHUB_URL}>GitHub ↗</a>
          <a href={cvAsset.url} download="Alexander_Krawec_CV.pdf">
            Download CV ↓
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </article>
  );
}

const VARIANTS: Array<{ key: PrototypeVariant; label: string }> = [
  { key: "A", label: "Journal" },
  { key: "B", label: "Instrument" },
  { key: "C", label: "Exhibition" },
];

function PrototypeSwitcher({
  active,
  onChange,
}: {
  active: PrototypeVariant;
  onChange: (variant: PrototypeVariant) => void;
}) {
  const index = VARIANTS.findIndex((item) => item.key === active);
  const step = (delta: number) => {
    const next = VARIANTS[(index + delta + VARIANTS.length) % VARIANTS.length];
    if (next) onChange(next.key);
  };
  const current = VARIANTS[index] ?? VARIANTS[0]!;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <nav className="dp-switcher actionbar" aria-label="Design prototype switcher">
      <button type="button" onClick={() => step(-1)} aria-label="Previous design">
        ←
      </button>
      <span>
        <strong>{active}</strong> · {current.label}
      </span>
      <button type="button" onClick={() => step(1)} aria-label="Next design">
        →
      </button>
    </nav>
  );
}

export function PortfolioDesignPrototypes({
  initialVariant,
}: {
  initialVariant: PrototypeVariant;
}) {
  const [variant, setVariant] = useState<PrototypeVariant>(initialVariant);

  const changeVariant = (next: PrototypeVariant) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.pushState({}, "", url);
    setVariant(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  useEffect(() => {
    const html = document.documentElement;
    const previous = {
      type: html.getAttribute("data-type"),
      radius: html.getAttribute("data-radius"),
      buttons: html.getAttribute("data-buttons"),
      title: document.title,
    };
    html.setAttribute("data-type", "service");
    html.setAttribute("data-radius", "soft");
    html.setAttribute(
      "data-buttons",
      variant === "A" ? "arrow" : variant === "B" ? "solid" : "block",
    );
    document.title = `Alex Krawec — ${VARIANTS.find((item) => item.key === variant)?.label} concept`;

    return () => {
      for (const [key, value] of Object.entries(previous)) {
        if (key === "title") continue;
        const attribute = `data-${key}`;
        if (value === null) html.removeAttribute(attribute);
        else html.setAttribute(attribute, value);
      }
      document.title = previous.title;
    };
  }, [variant]);

  useEffect(() => {
    const handlePopState = () => {
      const value = new URL(window.location.href).searchParams.get("variant");
      if (value === "A" || value === "B" || value === "C") setVariant(value);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <>
      {variant === "A" && <JournalDesign />}
      {variant === "B" && <InstrumentDesign />}
      {variant === "C" && <ExhibitionDesign />}
      <PrototypeSwitcher active={variant} onChange={changeVariant} />
    </>
  );
}
