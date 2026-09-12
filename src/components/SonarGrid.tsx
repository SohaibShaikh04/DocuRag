/**
 * SonarGrid.tsx
 *
 * Canvas-based ambient background: a sparse dot grid with occasional
 * sonar "ping" rings expanding outward from random grid nodes.
 *
 * Design intent:
 *   – Feels like a technical instrument / radar — not a screensaver.
 *   – Very low opacity so it never competes with content.
 *   – Uses the existing amber palette at extreme desaturation.
 *   – Respects prefers-reduced-motion (static grid only).
 *   – Pauses rendering when the tab is hidden (IntersectionObserver + visibilitychange).
 *   – Zero external dependencies — pure requestAnimationFrame canvas.
 */

import { useEffect, useRef } from "react";

// ─── Tuning ───────────────────────────────────────────────────────────────────
const SPACING        = 52;    // pixels between grid dots
const DOT_RADIUS     = 1.1;   // px — small, precise
const BASE_OPACITY   = 0.18;  // dot opacity
const PING_EVERY_MS  = 2800;  // ms between ring emissions
const RING_SPEED     = 0.55;  // px per frame
const RING_WIDTH     = 1.0;   // stroke width
const MAX_RINGS      = 5;     // cap concurrent rings
const MAX_RING_ALPHA = 0.28;  // peak ring opacity
// Amber at these opacity levels reads as a very subtle warm grey
const DOT_COLOR   = "245, 158, 11";
const RING_COLOR  = "245, 158, 11";
// ─────────────────────────────────────────────────────────────────────────────

interface Ring {
  x:      number;
  y:      number;
  radius: number;
  alpha:  number;
  maxR:   number;
}

export function SonarGrid() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const ringsRef    = useRef<Ring[]>([]);
  const lastPingRef = useRef<number>(0);
  const pausedRef   = useRef<boolean>(false);
  const reducedRef  = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Detect reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const onMqChange = () => { reducedRef.current = mq.matches; };
    mq.addEventListener("change", onMqChange);

    // Resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Visibility
    const onVisibility = () => { pausedRef.current = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    // IntersectionObserver — pause if canvas leaves viewport
    const observer = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // ── Grid dot positions ──────────────────────────────────────────────────
    const getDots = (): Array<{ x: number; y: number }> => {
      const dots = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const offX = ((w % SPACING) / 2);
      const offY = ((h % SPACING) / 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: offX + c * SPACING, y: offY + r * SPACING });
        }
      }
      return dots;
    };

    // ── Emit a new ring from a random grid node ─────────────────────────────
    const emitRing = (dots: Array<{ x: number; y: number }>) => {
      if (ringsRef.current.length >= MAX_RINGS) return;
      const dot = dots[Math.floor(Math.random() * dots.length)];
      const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.35;
      ringsRef.current.push({ x: dot.x, y: dot.y, radius: 0, alpha: MAX_RING_ALPHA, maxR });
    };

    // ── Draw ───────────────────────────────────────────────────────────────
    const draw = (ts: number) => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const dots = getDots();

      ctx.clearRect(0, 0, w, h);

      // Dot grid
      ctx.fillStyle = `rgba(${DOT_COLOR}, ${BASE_OPACITY})`;
      for (const { x, y } of dots) {
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      if (reducedRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Emit new ring on schedule
      if (ts - lastPingRef.current > PING_EVERY_MS) {
        emitRing(dots);
        lastPingRef.current = ts;
      }

      // Update & draw rings
      ringsRef.current = ringsRef.current.filter((ring) => ring.alpha > 0.005);
      for (const ring of ringsRef.current) {
        ring.radius += RING_SPEED;
        // Fade proportionally to expansion progress
        ring.alpha = MAX_RING_ALPHA * (1 - ring.radius / ring.maxR);

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RING_COLOR}, ${Math.max(0, ring.alpha)})`;
        ctx.lineWidth = RING_WIDTH;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onMqChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
