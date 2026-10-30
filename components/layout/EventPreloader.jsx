import { useEffect, useRef, useState } from "react";

/**
 * EventPreloader (theme-aware)
 *
 * Starts in a NEUTRAL monochrome palette (follows the visitor's system light/dark
 * so it never shouts a brand color). When your API returns the chosen theme, the
 * whole preloader morphs into that theme's mode + primary color, and only THEN
 * bursts and opens, so the site underneath always matches what they just saw.
 *
 * Props
 *  isReady       boolean  true when your data calls finish
 *  theme         {mode:'dark'|'light', primary:'#hex', background?:'#hex'}
 *                leave undefined until the API answers
 *  waitForTheme  boolean  hold the exit until theme arrives (default true,
 *                         10s failsafe so it can never hang)
 *  progress      number?  optional real 0-100 progress; otherwise simulated
 *  minDuration   number   minimum ms on screen (default 2200)
 *  word          string   default "EVENT"
 *  onComplete    fn       called after the doors finish opening
 */

const hex2rgb = (h) => {
  let s = String(h || "#888").replace("#", "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

const NEUTRAL = {
  dark: { bg: [10, 11, 14], fg: [238, 240, 247], muted: [140, 146, 160], c0: [150, 155, 170], c1: [245, 246, 250], accent: [205, 210, 220] },
  light: { bg: [244, 244, 246], fg: [18, 19, 24], muted: [110, 114, 124], c0: [70, 74, 86], c1: [18, 19, 24], accent: [95, 100, 112] },
};
const clone = (p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [...v]]));

const paletteFor = (theme, sysDark) => {
  const mode = theme && theme.mode === "light" ? "light" : theme && theme.mode === "dark" ? "dark" : sysDark ? "dark" : "light";
  const n = NEUTRAL[mode];
  if (!theme || !theme.primary) return clone(n);
  const dark = mode === "dark";
  let P = hex2rgb(theme.primary);
  // keep the primary readable against the mode's background
  if (dark && lum(P) < 0.3) P = mix(P, [255, 255, 255], 0.35);
  if (!dark && lum(P) > 0.7) P = mix(P, [0, 0, 0], 0.35);
  return {
    bg: theme.background ? hex2rgb(theme.background) : mix(n.bg, P, 0.05),
    fg: n.fg,
    muted: mix(n.muted, P, 0.3),
    c0: P,
    c1: dark ? mix(P, [255, 255, 255], 0.6) : mix(P, [0, 0, 0], 0.5),
    accent: dark ? mix(P, [255, 255, 255], 0.3) : P,
  };
};

const rgb = (c, a) => (a == null ? `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0})` : `rgb(${c[0] | 0} ${c[1] | 0} ${c[2] | 0} / ${a})`);

const STATUS = [
  [0, "Opening the doors"],
  [25, "Setting the stage"],
  [55, "Loading the schedule"],
  [85, "Finding your seat"],
  [100, "Welcome"],
];
const statusFor = (n) => {
  let s = STATUS[0][1];
  for (const [at, l] of STATUS) if (n >= at) s = l;
  return s;
};

const css = `
.ep-root{position:fixed;inset:0;z-index:9999;overflow:hidden;touch-action:none;
  font-family:'Unbounded','Segoe UI',system-ui,sans-serif;color:var(--ep-fg)}
.ep-panel{position:absolute;top:0;bottom:0;width:50%;background:var(--ep-bg);
  transition:transform 1s cubic-bezier(.77,0,.18,1),border-color .4s ease}
.ep-left{left:0;border-right:2px dashed transparent}
.ep-right{right:0;border-left:2px dashed transparent}
.ep-torn .ep-left{border-right-color:var(--ep-accent)}
.ep-torn .ep-right{border-left-color:var(--ep-accent)}
.ep-open .ep-left{transform:translateX(-101%)}
.ep-open .ep-right{transform:translateX(101%)}
.ep-glow{position:absolute;left:50%;top:46%;width:min(90vw,1100px);height:min(50vh,520px);
  transform:translate(-50%,-50%);pointer-events:none;opacity:.15;filter:blur(30px);
  background:radial-gradient(closest-side,var(--ep-glow),transparent 100%)}
.ep-canvas{position:absolute;inset:0;width:100%;height:100%}
.ep-hud{position:absolute;left:clamp(20px,4vw,56px);right:clamp(20px,4vw,56px);
  bottom:calc(clamp(24px,5vh,48px) + env(safe-area-inset-bottom,0px));
  display:flex;align-items:flex-end;justify-content:space-between;gap:16px;transition:opacity .35s ease}
.ep-num{font-size:clamp(48px,10vw,128px);font-weight:500;line-height:.9;
  font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.ep-num small{font-size:.35em;margin-left:.15em;color:var(--ep-muted)}
.ep-status{font-size:clamp(12px,1.4vw,15px);color:var(--ep-muted);text-align:right;padding-bottom:.4em}
.ep-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--ep-track);transition:opacity .35s}
.ep-bar i{display:block;height:100%;width:100%;transform:scaleX(0);transform-origin:left;
  background:linear-gradient(90deg,var(--ep-c0),var(--ep-c1),var(--ep-accent))}
.ep-hint{position:absolute;top:calc(clamp(20px,4vh,40px) + env(safe-area-inset-top,0px));
  left:0;right:0;text-align:center;font-size:13px;color:var(--ep-muted);animation:ep-hint 4.5s ease forwards}
@keyframes ep-hint{0%,70%{opacity:.9}100%{opacity:0}}
.ep-hide{opacity:0}
@media (prefers-reduced-motion:reduce){.ep-panel{transition-duration:.01s}.ep-hint{display:none}}
`;

export default function EventPreloader({
  isReady = false,
  theme,
  waitForTheme = true,
  progress,
  minDuration = 2200,
  word = "EVENT",
  onComplete,
}) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const numRef = useRef(null);
  const barRef = useRef(null);
  const statusRef = useRef(null);
  const live = useRef({});
  const [stage, setStage] = useState("load"); // load | burst | open | gone

  live.current = { isReady, theme, waitForTheme, progress, minDuration, onComplete };

  useEffect(() => {
    if (stage === "gone") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Unbounded:wght@500;800&display=swap";
    document.head.appendChild(link);

    let raf = 0, cancelled = false, parts = [], W = 0, H = 0;
    let shown = 0, auto = 0, phase = "load", burstAt = 0, lastLabel = "", themeKey = "";
    let cur = paletteFor(null, sysDark);
    let target = cur;
    let dustColor = "";
    const mouse = { x: -9999, y: -9999 };
    const timers = [];

    const applyVars = () => {
      const s = root.style;
      s.setProperty("--ep-bg", rgb(cur.bg));
      s.setProperty("--ep-fg", rgb(cur.fg));
      s.setProperty("--ep-muted", rgb(cur.muted));
      s.setProperty("--ep-track", rgb(cur.muted, 0.18));
      s.setProperty("--ep-c0", rgb(cur.c0));
      s.setProperty("--ep-c1", rgb(cur.c1));
      s.setProperty("--ep-accent", rgb(cur.accent));
      s.setProperty("--ep-glow", rgb(cur.c0, lum(cur.bg) > 0.5 ? 0.2 : 0.45));
    };
    const recolor = () => {
      for (const p of parts) p.c = rgb(mix(cur.c0, cur.c1, p.u));
      dustColor = rgb(cur.muted, 0.4);
      applyVars();
    };

    const build = () => {
      W = root.clientWidth;
      H = root.clientHeight;
      if (W <= 0 || H <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d", { willReadFrequently: true });
      const font = (s) => `800 ${s}px Unbounded, "Arial Black", Impact, sans-serif`;
      let fs = Math.min(W * 0.2, H * 0.34);
      o.font = font(fs);
      let m = o.measureText(word).width;
      if (m > W * 0.88) {
        fs *= (W * 0.88) / m;
        o.font = font(fs);
        m = o.measureText(word).width;
      }
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(word, W / 2, H * 0.46);

      const step = Math.max(3, Math.round(Math.sqrt((m * fs * 0.55) / 2600)));
      const data = o.getImageData(0, 0, W, H).data;
      const left = (W - m) / 2;
      const next = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            const tx = x + (Math.random() - 0.5) * step * 0.4;
            const ty = y + (Math.random() - 0.5) * step * 0.4;
            next.push({
              x: reduce ? tx : Math.random() * W,
              y: reduce ? ty : Math.random() * H,
              vx: 0, vy: 0, tx, ty,
              u: Math.min(1, Math.max(0, (tx - left) / m)),
              order: reduce ? 0 : Math.random(),
              seed: Math.random() * 6.28,
              r: step * 0.55 * (0.8 + Math.random() * 0.4),
              spark: Math.random() < 0.07,
              burst: false,
              c: "",
            });
          }
        }
      }
      parts = next;
      recolor();
    };

    const finish = () => {
      phase = "burst";
      burstAt = performance.now();
      setStage("burst");
      timers.push(setTimeout(() => setStage("open"), 650));
      timers.push(
        setTimeout(() => {
          setStage("gone");
          live.current.onComplete && live.current.onComplete();
        }, 1750)
      );
    };

    let t0 = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const L = live.current;
      const elapsed = now - t0;

      // --- palette: neutral until theme arrives, then morph ---
      const key = L.theme ? `${L.theme.mode}|${L.theme.primary}|${L.theme.background || ""}` : "";
      if (key !== themeKey) {
        themeKey = key;
        target = paletteFor(L.theme, sysDark);
      }
      let dist = 0;
      for (const k in cur) {
        for (let i = 0; i < 3; i++) {
          const d = target[k][i] - cur[k][i];
          dist = Math.max(dist, Math.abs(d));
          cur[k][i] += d * Math.min(1, dt * (reduce ? 30 : 3.2));
        }
      }
      if (dist > 0.4) recolor();
      const settled = dist < 2;

      // --- progress ---
      const themePending = L.waitForTheme && !L.theme && elapsed < 10000;
      if (phase === "load") {
        auto += (92 - auto) * dt * 0.55;
        let goal = typeof L.progress === "number" ? Math.min(L.progress, 95) : auto;
        const ok = L.isReady && elapsed >= L.minDuration && !themePending && settled;
        if (ok) goal = 100;
        shown = Math.max(shown, shown + (goal - shown) * Math.min(1, dt * (ok ? 4 : 2.2)));
        if (ok && shown > 99.4) {
          shown = 100;
          finish();
        }
      }

      const frac = shown / 100;
      const n = Math.floor(shown);
      if (numRef.current) numRef.current.firstChild.nodeValue = n;
      if (barRef.current) barRef.current.style.transform = `scaleX(${frac})`;
      if (glowRef.current) glowRef.current.style.opacity = 0.15 + 0.7 * frac;
      const label = L.isReady && themePending && shown > 85 ? "Applying your theme" : statusFor(n);
      if (label !== lastLabel && statusRef.current) {
        lastLabel = label;
        statusRef.current.textContent = label;
      }

      // --- particles ---
      ctx.clearRect(0, 0, W, H);
      const bursting = phase === "burst";
      const bt = bursting ? (now - burstAt) / 1000 : 0;
      ctx.globalAlpha = bursting ? Math.max(0, 1 - bt * 1.6) : 1;
      const R = Math.min(160, W * 0.22);
      const cx = W / 2, cy = H * 0.46;
      const damp = Math.exp(-dt * 11);
      const dust = Math.exp(-dt * 1.3);
      const sparkColor = rgb(cur.accent);

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const locked = p.order < frac;

        if (bursting) {
          if (!p.burst) {
            const dx = p.x - cx, dy = p.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            const s = 350 + Math.random() * 1100;
            p.vx = (dx / d) * s;
            p.vy = (dy / d) * s;
            p.burst = true;
          }
          if (!reduce) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
        } else if (!reduce) {
          let ax = 0, ay = 0;
          if (locked) {
            ax = (p.tx - p.x) * 80;
            ay = (p.ty - p.y) * 80;
          } else {
            ax = Math.cos(now * 0.0007 + p.seed * 3) * 70;
            ay = Math.sin(now * 0.0009 + p.seed * 5) * 70;
            if (p.x < 0) ax += 240;
            if (p.x > W) ax -= 240;
            if (p.y < 0) ay += 240;
            if (p.y > H) ay -= 240;
          }
          const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
          const md = Math.hypot(mdx, mdy);
          if (md < R && md > 0.01) {
            const f = 1 - md / R;
            const k = f * f * (locked ? 5000 : 2000);
            ax += (mdx / md) * k;
            ay += (mdy / md) * k;
          }
          p.vx = (p.vx + ax * dt) * (locked ? damp : dust);
          p.vy = (p.vy + ay * dt) * (locked ? damp : dust);
          const sp = Math.hypot(p.vx, p.vy);
          if (sp > 2200) {
            p.vx *= 2200 / sp;
            p.vy *= 2200 / sp;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }

        if (locked || bursting) {
          ctx.fillStyle = p.spark ? sparkColor : p.c;
          const r = p.spark ? p.r * 1.5 : p.r;
          ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
        } else {
          ctx.fillStyle = dustColor;
          const r = p.r * 0.6;
          ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
        }
      }
    };

    const onMove = (e) => {
      const rect = root.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    let rt;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(build, 150);
    };
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(onResize);
    resizeObserver?.observe(root);

    applyVars();
    const start = () => {
      if (cancelled) return;
      build();
      t0 = last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    Promise.race([
      document.fonts.load("800 100px Unbounded"),
      new Promise((r) => setTimeout(r, 1200)),
    ])
      .catch(() => {})
      .then(start);

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onMove);
    root.addEventListener("pointerup", onLeave);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      clearTimeout(rt);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerup", onLeave);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      link.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  if (stage === "gone") return null;

  const cls =
    "ep-root" + (stage !== "load" ? " ep-torn" : "") + (stage === "open" ? " ep-open" : "");

  return (
    <div
      ref={rootRef}
      className={cls}
      role="status"
      aria-live="polite"
      aria-label="Loading the event site"
      style={{ pointerEvents: stage === "open" ? "none" : "auto" }}
    >
      <style>{css}</style>
      <div className="ep-panel ep-left" />
      <div className="ep-panel ep-right" />
      <div ref={glowRef} className="ep-glow" />
      <canvas ref={canvasRef} className="ep-canvas" aria-hidden="true" />
      <div className="ep-hint">Move through the letters</div>
      <div className={"ep-hud" + (stage !== "load" ? " ep-hide" : "")}>
        <div className="ep-num">
          <span ref={numRef}>0</span>
          <small>%</small>
        </div>
        <div ref={statusRef} className="ep-status">Opening the doors</div>
      </div>
      <div className={"ep-bar" + (stage !== "load" ? " ep-hide" : "")} aria-hidden="true">
        <i ref={barRef} />
      </div>
    </div>
  );
}