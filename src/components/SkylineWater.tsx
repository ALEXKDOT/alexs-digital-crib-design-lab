import { useEffect, useRef, useState } from "react";

/**
 * SkylineWater
 * Drop-in replacement for the footer skyline <img>. Renders the same PNG on a
 * canvas and adds five ambient effects, all derived from the artwork itself —
 * no extra image assets:
 *
 *   1. Water ripple   — the water band shimmers; the skyline stays still.
 *   2. Cloud shadows  — soft patches drift across the water and the waterfront.
 *   3. Glint sweep    — a broad band of light crosses the water now and then.
 *   4. Sailboat       — a small sloop crosses slowly, trailing a wake and a reflection.
 *   5. Ferry          — a harbour ferry runs the other way, further out, passing
 *                       under the bridge span and behind the near tower.
 *
 * - No dependencies beyond React.
 * - Pauses when off-screen or when the tab is hidden.
 * - Honors prefers-reduced-motion (shows the still image).
 * - Falls back to the plain <img> if canvas is unavailable.
 */

export interface SkylineWaterProps {
  /** Imported image URL (must be same-origin, e.g. imported from src/assets). */
  src: string;
  alt?: string;
  className?: string;
  /** Ripple strength multiplier. 1 = default subtle. Try 0.6 – 1.6. */
  intensity?: number;
  /** Motion speed multiplier. 1 = default (slow drift). */
  speed?: number;
  /** Drifting cloud shadows over the water. Default true. */
  cloudShadows?: boolean;
  /** Slow sweep of light across the water. Default true. */
  glint?: boolean;
  /** A small sloop that crosses slowly, with wake and reflection. Default true. */
  sailboat?: boolean;
  /** A ferry that passes under the bridge, behind the tower. Default true. */
  ferry?: boolean;
}

/* ───────────────────────── engine ───────────────────────── */

// Geometry of the artwork (fractions of image height, measured from the PNG).
const BAND_TOP = 0.8; // top of the redrawn strip (low enough to catch the piers)
const WATERLINE = 0.905; // where buildings meet water — ripple starts here
const REF_WIDTH = 2172; // native width the effect sizes were tuned at
const FPS = 30;

// Cloud shadows: two blobs crossing at different speeds so they never sync up.
const CLOUD_A = { period: 104, radius: 0.3, weight: 1, seed: 0 };
const CLOUD_B = { period: 149, radius: 0.21, weight: 0.72, seed: 2.4 };
const SHADOW_ALPHA = 0.44; // how much denser the ink gets in full shadow
const SHADOW_DARK = 0.15; // how much darker the ink colour gets in full shadow

// Glint: a broad, slightly raked band of light crossing the water.
const GLINT_PERIOD = 26; // seconds per pass
const GLINT_SLOPE = 1.6; // horizontal px per vertical px — the rake
const GLINT_HALF_WIDTH = 0.16; // half-width as a fraction of image width
const GLINT_LIFT = 0.26; // how much the ink thins at the centre of the band

// Sailboat: a sloop drawn in the engraving's ink, sailing left to right.
const BOAT_Y = 0.928; // waterline of the hull, as a fraction of image height
const BOAT_SIZE = 1.25; // 1 = a 40px mast at native width
const BOAT_PERIOD = 150; // seconds per crossing
const BOAT_PHASE = 0.2; // where in the crossing it starts on load
const BOAT_MARGIN = 0.06; // how far past each edge it travels before looping
const BOAT_WAKE = 120; // wake length in boat units
const INK = "47,85,133"; // matched to the engraving's darkest blue
const SPRITE_W = 38; // sprite box in boat units; origin = midships at the waterline
const SPRITE_H = 47;
const SPRITE_OX = 18;
const SPRITE_OY = 43;

// Ferry: further out than the sailboat, heading right to left. It is kept low
// enough to clear the underside of the bridge deck, and it is hidden where it
// passes behind the near tower (the column range below, measured from the PNG).
const FERRY_Y = 0.9075; // its waterline — just below the far shore
const FERRY_SIZE = 1.2; // 1 = a 64px hull at native width
const FERRY_PERIOD = 183; // seconds per crossing
const FERRY_PHASE = 0.16; // starts right of the bridge, about to pass under it
const FERRY_WAKE = 80; // wake length in ferry units
const TOWER_X0 = 0.6773; // left edge of the near bridge tower
const TOWER_X1 = 0.7224; // right edge
const FERRY_W = 70; // sprite box in ferry units; origin = midships at the waterline
const FERRY_H = 30;
const FERRY_OX = 35;
const FERRY_OY = 26;

/** A vessel pre-drawn into two offscreen sprites, plus how it sits on the water. */
interface Vessel {
  ink: HTMLCanvasElement; // linework
  mask: HTMLCanvasElement; // solid silhouette, used to clear what is behind it
  unit: number; // canvas px per design unit
  ox: number; // sprite origin (midships at the waterline), in units
  oy: number;
  stern: number; // distance from midships to the stern, in units
  bow: number;
  height: number; // how much of it reflects, in units
  wake: number; // wake length, in units
  rock: number; // idle rocking, radians
}

const LUT_SIZE = 2048;
const LUT_MASK = LUT_SIZE - 1;
const SIN = new Float32Array(LUT_SIZE);
for (let i = 0; i < LUT_SIZE; i++) SIN[i] = Math.sin((i / LUT_SIZE) * Math.PI * 2);
const TO_LUT = LUT_SIZE / (Math.PI * 2);
const TAU = Math.PI * 2;

const smooth = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (u: number) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ink = (a: number) => `rgba(${INK},${a})`;

export interface WaterOptions {
  intensity: number;
  speed: number;
  animate: boolean;
  cloudShadows: boolean;
  glint: boolean;
  sailboat: boolean;
  ferry: boolean;
  /** Scene-clock start in seconds. For previews and tests only. */
  startAt?: number;
}

export function startWater(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  opts: WaterOptions,
): () => void {
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("2d canvas unavailable");

  let W = 0;
  let H = 0;
  let scale = 1;
  let bandY = 0;
  let bandH = 0;
  let src = new Uint8ClampedArray(0); // premultiplied RGBA of the redrawn band
  let out: ImageData | null = null;
  let rowAmpX = new Float32Array(0);
  let rowAmpY = new Float32Array(0);
  let rowPhase = new Float32Array(0);
  let rowKx = new Float32Array(0);
  let rowCrest = new Float32Array(0);
  let rowShadow = new Float32Array(0);
  let rowSweep = new Float32Array(0);
  let cloudCol = new Float32Array(0);
  let glintLut = new Float32Array(0);
  let glintOffset = 0;
  let boat: Vessel | null = null;
  let ferry: Vessel | null = null;

  let raf = 0;
  let visible = true;
  let last = 0;
  let t = opts.startAt ?? 0;
  let destroyed = false;

  function layout() {
    const cssW = canvas.clientWidth;
    if (!cssW || !img.naturalWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.min(Math.round(cssW * dpr), img.naturalWidth);
    if (w === W) return;
    W = w;
    H = Math.round((W * img.naturalHeight) / img.naturalWidth);
    scale = W / REF_WIDTH;
    canvas.width = W;
    canvas.height = H;
    ctx!.clearRect(0, 0, W, H);
    ctx!.drawImage(img, 0, 0, W, H);

    bandY = Math.floor(H * BAND_TOP);
    bandH = H - bandY;
    const data = ctx!.getImageData(0, bandY, W, bandH).data;
    src = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]! / 255;
      src[i] = data[i]! * a;
      src[i + 1] = data[i + 1]! * a;
      src[i + 2] = data[i + 2]! * a;
      src[i + 3] = data[i + 3]!;
    }
    out = ctx!.createImageData(W, bandH);

    // Per-row constants. Depth d runs 0 at the waterline → 1 at the bottom.
    const wl = H * WATERLINE - bandY;
    rowAmpX = new Float32Array(bandH);
    rowAmpY = new Float32Array(bandH);
    rowPhase = new Float32Array(bandH);
    rowKx = new Float32Array(bandH);
    rowCrest = new Float32Array(bandH);
    rowShadow = new Float32Array(bandH);
    rowSweep = new Float32Array(bandH);
    for (let j = 0; j < bandH; j++) {
      const d = Math.min(1, Math.max(0, (j - wl) / (bandH - wl)));
      const ease = smooth(Math.min(1, d / 0.22)); // no motion at the waterline → no seam
      const grow = 0.45 + 0.55 * d; // ripples get larger toward the viewer
      rowAmpX[j] = 5 * scale * opts.intensity * ease * grow;
      rowAmpY[j] = 2.6 * scale * opts.intensity * ease * grow;
      rowPhase[j] = 26 * Math.log(1 + d * 5); // crests bunch up near the horizon
      rowKx[j] = TAU / ((90 + 260 * d) * scale);
      rowCrest[j] = 0.2 * opts.intensity * ease;
      rowSweep[j] = GLINT_LIFT * ease;
      // Shadow fades in from nothing at the top of the band, so the buildings
      // only catch a hint of it and there is no edge where the band begins.
      rowShadow[j] =
        j < wl ? 0.45 * smooth(j / Math.max(1, wl)) : 0.45 + 0.55 * smooth(Math.min(1, d / 0.25));
    }

    cloudCol = new Float32Array(W);
    glintOffset = Math.ceil(bandH * GLINT_SLOPE);
    glintLut = new Float32Array(W + glintOffset + 2);
    buildBoat();
    buildFerry();
  }

  function addCloud(cx: number, r: number, weight: number, seed: number) {
    const lo = Math.max(0, Math.floor(cx - r * 1.3));
    const hi = Math.min(W - 1, Math.ceil(cx + r * 1.3));
    const k1 = TAU / (r * 0.52);
    const k2 = TAU / (r * 0.23);
    for (let x = lo; x <= hi; x++) {
      // Low-frequency wobble on the edge keeps the blob from reading as an oval.
      const d =
        (x - cx) / r +
        0.16 * SIN[((x * k1 + t * 0.21 + seed) * TO_LUT) & LUT_MASK]! +
        0.09 * SIN[((x * k2 - t * 0.13 + seed * 2) * TO_LUT) & LUT_MASK]!;
      const f = 1 - d * d;
      if (f > 0) {
        const v = f * f * f * weight;
        if (v > cloudCol[x]!) cloudCol[x] = v; // max-combine: overlaps merge, never stack
      }
    }
  }

  function buildFrameLuts() {
    if (opts.cloudShadows) {
      cloudCol.fill(0);
      for (const c of [CLOUD_A, CLOUD_B]) {
        const r = c.radius * W;
        const cx = ((t / c.period) % 1) * (W + 2 * r) - r;
        addCloud(cx, r, c.weight, c.seed);
      }
    }
    if (opts.glint) {
      glintLut.fill(0);
      const hw = GLINT_HALF_WIDTH * W;
      const span = W + glintOffset + 2 * hw;
      const centre = -glintOffset - hw + ((t / GLINT_PERIOD) % 1) * span;
      const lo = Math.max(0, Math.floor(centre - hw) + glintOffset);
      const hi = Math.min(glintLut.length - 1, Math.ceil(centre + hw) + glintOffset);
      for (let i = lo; i <= hi; i++) {
        const d = (i - glintOffset - centre) / hw;
        const f = 1 - d * d;
        glintLut[i] = f > 0 ? f * f : 0;
      }
    }
  }

  /** Vertical and horizontal displacement of the surface at a point, for floaters. */
  function surfaceAt(x: number, j: number): [number, number] {
    if (j < 0 || j >= bandH) return [0, 0];
    const xk = x * rowKx[j]!;
    const ph = rowPhase[j]!;
    const s1 = SIN[((ph - t * 1.05 + xk * 0.35) * TO_LUT) & LUT_MASK]!;
    const s2 = SIN[((ph * 1.7 + t * 0.7 - xk) * TO_LUT) & LUT_MASK]!;
    const s3 = SIN[((ph * 0.6 - t * 0.45 + xk * 0.5) * TO_LUT) & LUT_MASK]!;
    return [-rowAmpX[j]! * (s2 * 0.65 + s3 * 0.35), -rowAmpY[j]! * (s1 * 0.7 + s2 * 0.3)];
  }

  function render() {
    if (!out) return;
    const o = out.data;
    const maxY = bandH - 1;
    const maxX = W - 1;
    const t1 = t * 1.05;
    const t2 = t * 0.7;
    const t3 = t * 0.45;
    const shade = opts.cloudShadows;
    const sweep = opts.glint;

    for (let j = 0; j < bandH; j++) {
      const ax = rowAmpX[j]!;
      const ay = rowAmpY[j]!;
      const rowOff = j * W * 4;
      const shRow = shade ? rowShadow[j]! : 0;
      const swRow = sweep ? rowSweep[j]! : 0;
      const gBase = glintOffset - ((j * GLINT_SLOPE) | 0);

      if (ax === 0) {
        // Above the waterline: no ripple, but cloud shadow still falls here.
        for (let x = 0; x < W; x++) {
          const i = rowOff + x * 4;
          const aw = src[i + 3]!;
          if (aw === 0) {
            o[i + 3] = 0;
            continue;
          }
          let am = 1;
          let cm = 1;
          if (shRow > 0) {
            const s = cloudCol[x]! * shRow;
            am += s * SHADOW_ALPHA;
            cm -= s * SHADOW_DARK;
          }
          if (swRow > 0) {
            const f = glintLut[x + gBase]!;
            if (f > 0) {
              const q = f * swRow;
              am -= q;
              cm += q * 0.2;
            }
          }
          const a = aw * am;
          o[i + 3] = a > 255 ? 255 : a;
          const inv = (255 * cm) / aw;
          o[i] = src[i]! * inv;
          o[i + 1] = src[i + 1]! * inv;
          o[i + 2] = src[i + 2]! * inv;
        }
        continue;
      }

      const ph = rowPhase[j]!;
      const kx = rowKx[j]!;
      const g = rowCrest[j]!;

      for (let x = 0; x < W; x++) {
        const xk = x * kx;
        // Two crossing wave trains, mostly horizontal crests, drifting slowly.
        const p1 = (ph - t1 + xk * 0.35) * TO_LUT;
        const p2 = (ph * 1.7 + t2 - xk) * TO_LUT;
        const p3 = (ph * 0.6 - t3 + xk * 0.5) * TO_LUT;
        const s1 = SIN[p1 & LUT_MASK]!;
        const s2 = SIN[p2 & LUT_MASK]!;
        const s3 = SIN[p3 & LUT_MASK]!;

        let sx = x + ax * (s2 * 0.65 + s3 * 0.35);
        let sy = j + ay * (s1 * 0.7 + s2 * 0.3);
        if (sx < 0) sx = 0;
        else if (sx > maxX) sx = maxX;
        if (sy < 0) sy = 0;
        else if (sy > maxY) sy = maxY;

        const x0 = sx | 0;
        const y0 = sy | 0;
        const fx = sx - x0;
        const fy = sy - y0;
        const x1 = x0 < maxX ? x0 + 1 : x0;
        const y1 = y0 < maxY ? y0 + 1 : y0;
        const i00 = (y0 * W + x0) * 4;
        const i10 = (y0 * W + x1) * 4;
        const i01 = (y1 * W + x0) * 4;
        const i11 = (y1 * W + x1) * 4;
        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;

        // Ink thins on wave crests, thickens in cloud shadow, thins under the
        // passing band of light. Alpha carries density, cm carries tone.
        let am = 1;
        let cm = 1;
        const crest = s1 * s3;
        if (crest > 0) am -= g * crest;
        if (shRow > 0) {
          const s = cloudCol[x]! * shRow;
          am += s * SHADOW_ALPHA;
          cm -= s * SHADOW_DARK;
        }
        if (swRow > 0) {
          const f = glintLut[x + gBase]!;
          if (f > 0) {
            const q = f * swRow;
            am -= q;
            cm += q * 0.2;
          }
        }

        const aw =
          src[i00 + 3]! * w00 + src[i10 + 3]! * w10 + src[i01 + 3]! * w01 + src[i11 + 3]! * w11;
        const oi = rowOff + x * 4;
        if (aw < 0.5) {
          o[oi + 3] = 0;
          continue;
        }
        const a = aw * am;
        o[oi + 3] = a > 255 ? 255 : a;
        const inv = (255 * cm) / aw;
        o[oi] = (src[i00]! * w00 + src[i10]! * w10 + src[i01]! * w01 + src[i11]! * w11) * inv;
        o[oi + 1] =
          (src[i00 + 1]! * w00 + src[i10 + 1]! * w10 + src[i01 + 1]! * w01 + src[i11 + 1]! * w11) *
          inv;
        o[oi + 2] =
          (src[i00 + 2]! * w00 + src[i10 + 2]! * w10 + src[i01 + 2]! * w01 + src[i11 + 2]! * w11) *
          inv;
      }
    }
    ctx!.putImageData(out, 0, bandY);
  }

  /**
   * Draws the sloop once into two small offscreen sprites: `mask` is its solid
   * silhouette (used to clear the skyline behind the sails, so the paper shows
   * through on any background colour) and `ink` is the linework laid on top.
   */
  function buildBoat() {
    boat = null;
    if (!opts.sailboat) return;
    const roomAbove = H * BOAT_Y - bandY - 4; // the mast must stay inside the redrawn band
    const unit = Math.min(BOAT_SIZE * Math.max(scale, 0.5), roomAbove / SPRITE_OY);
    const k = unit * 2; // sprites are drawn at 2× and scaled down for clean edges
    const make = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
      const c = document.createElement("canvas");
      c.width = Math.ceil(SPRITE_W * k);
      c.height = Math.ceil(SPRITE_H * k);
      const g = c.getContext("2d")!;
      g.setTransform(k, 0, 0, k, SPRITE_OX * k, SPRITE_OY * k);
      g.lineJoin = "round";
      g.lineCap = "round";
      return [c, g];
    };
    type G = CanvasRenderingContext2D;
    const hull = (g: G) => {
      g.beginPath();
      g.moveTo(-14, -3.6);
      g.lineTo(-13, 0.5);
      g.quadraticCurveTo(0, 1.7, 12, 0.5);
      g.lineTo(16.5, -4.8);
      g.quadraticCurveTo(2, -2.9, -14, -3.6);
      g.closePath();
    };
    const cabin = (g: G) => {
      g.beginPath();
      g.moveTo(-7, -3.2);
      g.lineTo(-6.2, -5.4);
      g.lineTo(3.4, -5.2);
      g.lineTo(4.6, -3.2);
      g.closePath();
    };
    const mainsail = (g: G) => {
      g.beginPath();
      g.moveTo(0.3, -38.5);
      g.quadraticCurveTo(-8.6, -21, -13, -6.6);
      g.lineTo(0.3, -7);
      g.closePath();
    };
    const jib = (g: G) => {
      g.beginPath();
      g.moveTo(1.7, -33.5);
      g.lineTo(15.4, -5.6);
      g.quadraticCurveTo(8, -6, 3.2, -8);
      g.quadraticCurveTo(3.4, -21, 1.7, -33.5);
      g.closePath();
    };
    const line = (g: G, x0: number, y0: number, x1: number, y1: number, w: number, a: number) => {
      g.strokeStyle = ink(a);
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
    };

    const [maskCanvas, m] = make();
    m.fillStyle = "#000";
    for (const shape of [hull, cabin, mainsail, jib]) {
      shape(m);
      m.fill();
    }

    const [inkCanvas, g] = make();
    line(g, 1, -40.5, -14, -3.6, 0.25, 0.5); // backstay
    line(g, 1, -39, 16.5, -4.8, 0.25, 0.5); // forestay
    // Sails: a breath of tone, shading that deepens toward the mast, panel seams.
    const sails: [(g: G) => void, number, number, number][] = [
      [mainsail, 0.3, -9, 1.1],
      [jib, 2.6, 11, -1.4],
    ];
    for (const [shape, shadeFrom, shadeTo, seamTilt] of sails) {
      g.save();
      shape(g);
      g.clip();
      g.fillStyle = ink(0.05);
      g.fillRect(-20, -45, 45, 50);
      const shade = g.createLinearGradient(shadeFrom, 0, shadeTo, 0);
      shade.addColorStop(0, ink(0.36));
      shade.addColorStop(1, ink(0));
      g.fillStyle = shade;
      g.fillRect(-20, -45, 45, 50);
      for (let y = -34; y < -7; y += 4.4) line(g, -16, y + seamTilt, 17, y - seamTilt, 0.28, 0.32);
      g.restore();
      shape(g);
      g.strokeStyle = ink(0.9);
      g.lineWidth = 0.55;
      g.stroke();
    }
    line(g, 1, -3.4, 1, -40.5, 0.75, 0.95); // mast
    line(g, 0.6, -6.4, -13.6, -6, 0.6, 0.9); // boom
    g.fillStyle = ink(0.85); // pennant
    g.beginPath();
    g.moveTo(1, -40.6);
    g.lineTo(-3.2, -39.6);
    g.lineTo(1, -38.6);
    g.fill();
    cabin(g);
    g.fillStyle = ink(0.75);
    g.fill();
    hull(g);
    g.fillStyle = ink(0.9);
    g.fill();
    g.globalCompositeOperation = "destination-out"; // sheer stripe, cut back to paper
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.lineWidth = 0.42;
    g.beginPath();
    g.moveTo(15.2, -3.8);
    g.quadraticCurveTo(2, -1.9, -13.5, -2.6);
    g.stroke();

    boat = {
      ink: inkCanvas,
      mask: maskCanvas,
      unit,
      ox: SPRITE_OX,
      oy: SPRITE_OY,
      stern: 13,
      bow: 16,
      height: 40,
      wake: BOAT_WAKE,
      rock: 0.014,
    };
  }

  /** The ferry, drawn the same way. Its sprite is mirrored so the bow points left. */
  function buildFerry() {
    ferry = null;
    if (!opts.ferry) return;
    const roomAbove = H * FERRY_Y - bandY - 3;
    const unit = Math.min(FERRY_SIZE * Math.max(scale, 0.5), roomAbove / FERRY_OY);
    const k = unit * 2;
    const make = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
      const c = document.createElement("canvas");
      c.width = Math.ceil(FERRY_W * k);
      c.height = Math.ceil(FERRY_H * k);
      const g = c.getContext("2d")!;
      g.setTransform(-k, 0, 0, k, (FERRY_W - FERRY_OX) * k, FERRY_OY * k);
      g.lineJoin = "round";
      return [c, g];
    };
    type G = CanvasRenderingContext2D;
    const hull = (g: G) => {
      g.beginPath();
      g.moveTo(-32, -5);
      g.lineTo(-30, 0.6);
      g.quadraticCurveTo(0, 1.6, 28, 0.6);
      g.lineTo(33, -5.3);
      g.quadraticCurveTo(0, -4.3, -32, -5);
      g.closePath();
    };
    const funnel = (g: G) => {
      g.beginPath();
      g.moveTo(-9, -15.6);
      g.lineTo(-8.2, -22.6);
      g.lineTo(-3.6, -22.6);
      g.lineTo(-3, -15.6);
      g.closePath();
    };
    // Deckhouses as [x, y, width, height]: main deck, upper deck, wheelhouse.
    const houses: [number, number, number, number][] = [
      [-27, -10.6, 52, 5.9],
      [-22, -15.6, 41, 5],
      [7, -19.6, 9, 4],
    ];

    const [maskCanvas, m] = make();
    m.fillStyle = "#000";
    hull(m);
    m.fill();
    funnel(m);
    m.fill();
    for (const [x, y, w, h] of houses) m.fillRect(x, y, w, h);

    const [inkCanvas, g] = make();
    const stroke = (x0: number, y0: number, x1: number, y1: number, w: number, a: number) => {
      g.strokeStyle = ink(a);
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
    };
    stroke(11.5, -19.6, 11.5, -24.6, 0.35, 0.85); // mast
    stroke(-30.5, -5, -30.5, -9.6, 0.3, 0.8); // flagstaff
    g.fillStyle = ink(0.8);
    g.fillRect(-33.4, -9.6, 2.9, 1.7); // ensign
    funnel(g);
    g.fillStyle = ink(0.88);
    g.fill();
    houses.forEach(([x, y, w, h], deck) => {
      g.fillStyle = ink(0.09);
      g.fillRect(x, y, w, h);
      g.strokeStyle = ink(0.85);
      g.lineWidth = 0.4;
      g.strokeRect(x, y, w, h);
      g.fillStyle = ink(0.72); // a row of windows along each deck
      const step = deck === 2 ? 2.2 : 2.7;
      for (let wx = x + 1.3; wx < x + w - 1.6; wx += step) g.fillRect(wx, y + 1.3, 1.5, h - 3.1);
    });
    stroke(5.6, -19.7, 17.4, -19.7, 0.6, 0.9); // wheelhouse roof
    stroke(-23.5, -15.7, 20.5, -15.7, 0.5, 0.9); // upper deck edge
    hull(g);
    g.fillStyle = ink(0.9);
    g.fill();
    g.globalCompositeOperation = "destination-out"; // cut back to paper:
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.lineWidth = 0.5;
    g.beginPath(); // rubbing strake along the hull
    g.moveTo(31.6, -3.6);
    g.quadraticCurveTo(0, -2.7, -31, -3.3);
    g.stroke();
    g.fillStyle = "rgba(0,0,0,0.8)";
    g.fillRect(-8.6, -20.9, 5.4, 1.1); // band on the funnel

    ferry = {
      ink: inkCanvas,
      mask: maskCanvas,
      unit,
      ox: FERRY_W - FERRY_OX,
      oy: FERRY_OY,
      stern: 31,
      bow: 32,
      height: 24,
      wake: FERRY_WAKE,
      rock: 0.003,
    };
  }

  /**
   * Draws one vessel with its wake and reflection. `fx` is its position as a
   * fraction of the image width, `fy` its waterline, `dir` +1 when it is
   * heading right and -1 when heading left.
   */
  function drawVessel(v: Vessel, fx: number, fy: number, dir: number) {
    const u = v.unit;
    // The water fades to bare paper at both ends of the plate; vessels fade with it.
    const edge = smooth(clamp01((fx - 0.03) / 0.08)) * smooth(clamp01((0.97 - fx) / 0.08));
    if (edge <= 0) return;

    const bx = fx * W;
    const by = H * fy;
    const j = Math.round(by - bandY);
    const bob = surfaceAt(bx, j)[1];
    const pitch = (surfaceAt(bx + 9 * u, j)[1] - surfaceAt(bx - 9 * u, j)[1]) / (18 * u);
    const rock = pitch * 0.9 + v.rock * SIN[(t * 0.8 * TO_LUT) & LUT_MASK]!;
    const rot = rock > 0.06 ? 0.06 : rock < -0.06 ? -0.06 : rock;
    const cy = by + bob * 0.7;
    const stern = bx - dir * v.stern * u;
    const bow = bx + dir * v.bow * u;
    const len = v.wake * u;
    const tail = stern - dir * len;
    const c = ctx!;
    c.save();
    c.lineCap = "round";

    // Wake 1: churned water astern reads lighter — thin the ink in a long wedge.
    c.globalCompositeOperation = "destination-out";
    const churn = c.createLinearGradient(stern, 0, tail, 0);
    churn.addColorStop(0, `rgba(0,0,0,${0.8 * edge})`);
    churn.addColorStop(0.45, `rgba(0,0,0,${0.35 * edge})`);
    churn.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = churn;
    c.beginPath();
    c.moveTo(stern + dir * 2 * u, cy - 0.2 * u);
    c.lineTo(tail, cy - 0.2 * u - len * 0.012);
    c.lineTo(tail, cy + 2 * u + len * 0.05);
    c.lineTo(stern + dir * 2 * u, cy + 2 * u);
    c.closePath();
    c.fill();
    // Bow wave: a small curl of white water.
    c.strokeStyle = `rgba(0,0,0,${0.55 * edge})`;
    c.lineWidth = 1.1 * u;
    c.beginPath();
    c.moveTo(bow - dir * 0.5 * u, cy + 0.3 * u);
    c.quadraticCurveTo(bow - dir * 4 * u, cy + 1.5 * u, bow - dir * 9 * u, cy + 1.7 * u);
    c.stroke();

    // Wake 2: engraved wavelets along the two arms of the wake and its centre.
    // They are pinned to the water, not the vessel, so it sails away from them.
    c.globalCompositeOperation = "source-over";
    c.lineWidth = Math.max(0.7, 0.62 * u);
    const gap = 8 * u;
    const first = Math.floor(Math.min(stern, tail) / gap) - 1;
    const lastN = Math.ceil(Math.max(stern, tail) / gap) + 1;
    for (let n = first; n <= lastN; n++) {
      for (let arm = 0; arm < 3; arm++) {
        const wx = n * gap - arm * gap * 0.37;
        const d = (stern - wx) * dir;
        if (d < 0 || d > len) continue;
        const f = 1 - d / len;
        const y0 =
          cy +
          (arm === 0 ? -0.3 * u - d * 0.012 : arm === 1 ? 2.1 * u + d * 0.05 : 0.9 * u + d * 0.02);
        const y = y0 + surfaceAt(wx, Math.round(y0 - bandY))[1];
        c.strokeStyle = ink((arm === 2 ? 0.3 : 0.7) * f * Math.sqrt(f) * edge);
        c.beginPath();
        c.moveTo(wx, y);
        c.lineTo(wx - dir * 5.5 * u, y + (arm === 1 ? 0.22 : arm === 0 ? -0.05 : 0.1) * u);
        c.stroke();
      }
    }
    c.strokeStyle = ink(0.45 * edge);
    c.beginPath();
    c.moveTo(bow, cy + 1.2 * u);
    c.quadraticCurveTo(bow - dir * 4 * u, cy + 2.3 * u, bow - dir * 10 * u, cy + 2.5 * u);
    c.stroke();

    // Reflection: the sprite upside down, squashed, cut into thin strips that
    // each ride the surface at their own depth, fading as they go down.
    const sw = v.ink.width;
    const dw = sw / 2;
    const dx = bx - v.ox * u;
    const squash = 0.7;
    const strip = Math.max(1, 1.4 * u);
    const strips = Math.ceil((v.height * u * squash) / strip);
    const waterRow = v.oy * u * 2;
    for (let i = 0; i < strips; i++) {
      const depth = i * strip;
      const srcH = (strip / squash) * 2;
      const srcY = waterRow - ((depth + strip) / squash) * 2;
      if (srcY < 0) break;
      const dy = cy + 0.8 * u + depth;
      const wob = surfaceAt(bx, Math.round(dy - bandY))[0] * 1.3;
      const fade = 0.55 * Math.pow(1 - i / strips, 1.2) * edge;
      c.globalCompositeOperation = "destination-out";
      c.globalAlpha = fade * 0.9;
      c.drawImage(v.mask, 0, srcY, sw, srcH, dx + wob, dy, dw, strip);
      c.globalCompositeOperation = "source-over";
      c.globalAlpha = fade;
      c.drawImage(v.ink, 0, srcY, sw, srcH, dx + wob, dy, dw, strip);
    }

    // The vessel itself: clear what is behind it, then lay down the linework.
    c.translate(bx, cy);
    c.rotate(rot);
    c.globalCompositeOperation = "destination-out";
    c.globalAlpha = 0.95 * edge;
    c.drawImage(v.mask, -v.ox * u, -v.oy * u, dw, v.mask.height / 2);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = edge;
    c.drawImage(v.ink, -v.ox * u, -v.oy * u, dw, v.ink.height / 2);
    c.restore();
  }

  function drawTraffic() {
    const span = 1 + 2 * BOAT_MARGIN;
    if (ferry && out) {
      const fx = 1 + BOAT_MARGIN - ((t / FERRY_PERIOD + FERRY_PHASE) % 1) * span;
      drawVessel(ferry, fx, FERRY_Y, -1);
      // The near bridge tower stands in front of the ferry: put its columns
      // back exactly as rendered this frame, reflection included.
      const x0 = Math.floor(W * TOWER_X0);
      ctx!.putImageData(out, 0, bandY, x0, 0, Math.ceil(W * TOWER_X1) - x0, bandH);
    }
    if (boat) {
      const fx = ((t / BOAT_PERIOD + BOAT_PHASE) % 1) * span - BOAT_MARGIN;
      drawVessel(boat, fx, BOAT_Y, 1);
    }
  }

  function frame(now: number) {
    raf = 0;
    if (destroyed || !visible || document.hidden) return;
    const dt = now - last;
    if (dt >= 1000 / FPS - 2) {
      t += (Math.min(dt, 100) / 1000) * opts.speed;
      last = now;
      buildFrameLuts();
      render();
      drawTraffic();
    }
    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!opts.animate || raf || destroyed || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  layout();

  const ro = new ResizeObserver(() => layout());
  ro.observe(canvas);
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1]!.isIntersecting;
      kick();
    },
    { rootMargin: "100px" },
  );
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener("visibilitychange", onVis);
  kick();

  return () => {
    destroyed = true;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
  };
}

/* ──────────────────────── component ──────────────────────── */

export default function SkylineWater({
  src,
  alt = "",
  className,
  intensity = 1,
  speed = 1,
  cloudShadows = true,
  glint = true,
  sailboat = true,
  ferry = true,
}: SkylineWaterProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return; // keep the still <img>

    let stop: (() => void) | undefined;
    let cancelled = false;

    const begin = () => {
      if (cancelled || stop) return;
      try {
        stop = startWater(canvas, img, {
          intensity,
          speed,
          animate: true,
          cloudShadows,
          glint,
          sailboat,
          ferry,
        });
        setReady(true);
      } catch {
        setReady(false); // tainted canvas or no 2d context → still image
      }
    };

    if (img.complete && img.naturalWidth) begin();
    else img.addEventListener("load", begin, { once: true });

    return () => {
      cancelled = true;
      img.removeEventListener("load", begin);
      stop?.();
      setReady(false);
    };
  }, [src, intensity, speed, cloudShadows, glint, sailboat, ferry]);

  return (
    <div className={className} style={{ position: "relative", lineHeight: 0 }}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={1920}
        height={640}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          opacity: ready ? 0 : 1,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: ready ? 1 : 0,
        }}
      />
    </div>
  );
}
