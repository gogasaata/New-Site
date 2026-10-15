"use client";

import { useEffect, useRef } from "react";
import { geoEquirectangular, geoInterpolate, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import land110 from "world-atlas/land-110m.json";

type Dot = { lon: number; lat: number };

const RAD = Math.PI / 180;
// Major hubs the red "connection" arcs run between [lon, lat]
const HUBS: [number, number][] = [
  [-0.12, 51.5], [13.4, 52.5], [37.6, 55.75], [28.97, 41.0], [55.3, 25.2],
  [31.2, 30.0], [3.4, 6.5], [18.4, -33.9], [77.2, 28.6], [67.0, 24.9],
  [-74, 40.7], [2.35, 48.85], [12.5, 41.9], [44.8, 41.7], [121.5, 31.2],
];
const ARCS: [number, number][] = [
  [0, 4], [1, 5], [2, 6], [3, 7], [4, 8], [0, 10], [1, 9], [3, 14], [12, 6], [2, 8], [11, 5], [13, 4], [0, 7],
];

/** Sample the land mask into a regular lon/lat dot grid (dot-matrix globe). */
function buildDots(): Dot[] {
  const W = 720, H = 360;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  const projection = geoEquirectangular().fitSize([W, H], { type: "Sphere" } as never);
  const path = geoPath(projection, ctx);
  const land = feature(land110 as never, (land110 as never as { objects: { land: never } }).objects.land);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  path(land as never);
  ctx.fill();
  const data = ctx.getImageData(0, 0, W, H).data;
  const dots: Dot[] = [];
  const step = 0.62;
  for (let lat = -58; lat <= 80; lat += step) {
    const lonStep = step / Math.max(Math.cos(lat * RAD), 0.2);
    for (let lon = -180; lon < 180; lon += lonStep) {
      const x = Math.floor(((lon + 180) / 360) * W);
      const y = Math.floor(((90 - lat) / 180) * H);
      if (data[(y * W + x) * 4 + 3] > 128) dots.push({ lon, lat });
    }
  }
  return dots;
}

export default function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dots = buildDots();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const arcs = ARCS.map(([a, b]) => {
      const interp = geoInterpolate(HUBS[a], HUBS[b]);
      const pts: { lon: number; lat: number; h: number }[] = [];
      const n = 48;
      for (let i = 0; i <= n; i++) {
        const [lon, lat] = interp(i / n);
        pts.push({ lon, lat, h: 1 + 0.16 * Math.sin((i / n) * Math.PI) });
      }
      return pts;
    });

    let w = 0, h = 0, dpr = 1;
    // view state: centre of the visible hemisphere (Europe / Middle East at night)
    let rotLon = 50, rotLat = 10;
    let dragging = false, lastX = 0, lastY = 0, interacted = false;
    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
    };

    const project = (lon: number, lat: number, rad: number, cx: number, cy: number, R: number) => {
      const φ = lat * RAD, λ = (lon - rotLon) * RAD, φ0 = rotLat * RAD;
      const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
      const x = rad * Math.cos(φ) * Math.sin(λ);
      const y = rad * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));
      return { x: cx + x * R, y: cy - y * R, vis: cosc > 0.02 || (rad > 1 && cosc > -0.1), cosc };
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // globe larger than its frame: clipped by the right / top edges like the design
      const narrow = w < 640;
      const R = narrow ? w * 0.85 : w * 0.56;
      const cx = narrow ? w * 0.8 : w * 0.94;
      const cy = narrow ? h * 1.0 : h * 1.4;

      if (!reduce && !dragging && !interacted) {
        const t = (now - t0) / 1000;
        rotLon = 50 + Math.sin(t * 0.12) * 8;
        rotLat = 10 + Math.sin(t * 0.09) * 2;
      }

      // sphere body
      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "#3a3436");
      body.addColorStop(0.4, "#100e10");
      body.addColorStop(1, "#050404");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // clip everything to the sphere
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // city-light dots
      for (const d of dots) {
        const p = project(d.lon, d.lat, 1, cx, cy, R);
        if (!p.vis) continue;
        const edge = Math.pow(Math.max(p.cosc, 0), 0.55);
        const warm = 0.35 + 0.65 * Math.abs(Math.sin(d.lon * 12.9898 + d.lat * 78.233) * 43758.5453 % 1);
        ctx.fillStyle = `rgba(${200 + 40 * warm | 0}, ${130 + 60 * warm | 0}, ${60 + 40 * warm | 0}, ${0.4 + 0.8 * edge * warm})`;
        const s = (1.4 + 1.6 * warm) * (R / 700) * (0.5 + 0.5 * edge);
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }

      // connection arcs
      ctx.lineCap = "round";
      arcs.forEach((pts, i) => {
        ctx.beginPath();
        let started = false;
        for (const q of pts) {
          const p = project(q.lon, q.lat, q.h, cx, cy, R);
          if (p.cosc <= 0.02) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `rgba(190, 28, 52, ${0.55 + 0.25 * ((i % 3) / 2)})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });
      ctx.restore();

      // hub glows
      for (const [lon, lat] of HUBS) {
        const p = project(lon, lat, 1, cx, cy, R);
        if (p.cosc <= 0.05) continue;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
        g.addColorStop(0, "rgba(255,190,110,0.9)");
        g.addColorStop(1, "rgba(255,190,110,0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 9, p.y - 9, 18, 18);
      }

      // atmosphere rim (light grey halo on the upper-left limb, as in the design)
      const rim = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.015);
      rim.addColorStop(0, "rgba(255,255,255,0)");
      rim.addColorStop(0.85, "rgba(190,185,190,0.18)");
      rim.addColorStop(1, "rgba(255,255,255,0.5)");
      ctx.fillStyle = rim;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.015, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    const down = (e: PointerEvent) => { dragging = true; interacted = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      rotLon -= (e.clientX - lastX) * 0.2;
      rotLat = Math.max(-60, Math.min(70, rotLat + (e.clientY - lastY) * 0.2));
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-label="Interactive globe showing Europe and the Middle East at night"
      className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
    />
  );
}
