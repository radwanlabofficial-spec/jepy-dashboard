/**
 * LeadStream — animated canvas of tier-colored dots flowing through the
 * command-deck hero. Adapted from the concept-bold-v4 static mock.
 *
 * - Dots spawn on the left and drift right; HOT dots emit expanding pulse
 *   rings as they "land" on the right edge.
 * - Pauses when the tab is hidden (visibilitychange) and on unmount.
 * - Honors prefers-reduced-motion: renders a single static frame.
 */

import { useEffect, useRef } from 'react';

const TIER_COLORS = { hot: '#34d399', warm: '#fbbf24', cold: '#a78bfa' } as const;
const COMPANIES = [
  'Acme Corp', 'TechFlow Inc', 'NexaLabs', 'CloudNine', 'DataBridge',
  'Brightline Co', 'Voxel Works', 'LoopCraft', 'StatMinds', 'FlowPilot',
  'HexaData', 'PixelMint',
];

type Tier = keyof typeof TIER_COLORS;

interface Dot {
  x: number;
  y: number;
  v: number;
  r: number;
  tier: Tier;
  landed: boolean;
}

interface Pulse {
  x: number;
  y: number;
  r: number;
  a: number;
}

export default function LeadStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;
    let lastT = 0;
    let lastSpawn = 0;
    let companyIdx = 0;
    const dots: Dot[] = [];
    const pulses: Pulse[] = [];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      W = Math.max(rect.width, 50);
      H = Math.max(rect.height, 20);
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    function spawn() {
      const roll = Math.random();
      const tier: Tier = roll < 0.12 ? 'hot' : roll < 0.45 ? 'warm' : 'cold';
      companyIdx += 1;
      dots.push({
        x: -12,
        y: 8 + Math.random() * Math.max(H - 16, 4),
        v: 45 + Math.random() * 70,
        r: tier === 'hot' ? 3.4 : 2.6,
        tier,
        landed: false,
      });
    }

    function draw(dtMs: number) {
      const s = Math.min(dtMs / 1000, 0.05);
      if (!reduceMotion && lastT - lastSpawn > 650 && dots.length < 30) {
        lastSpawn = lastT;
        spawn();
      }
      ctx!.clearRect(0, 0, W, H);

      // faint center guide line
      ctx!.strokeStyle = 'rgba(255,255,255,.07)';
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, H / 2);
      ctx!.lineTo(W, H / 2);
      ctx!.stroke();

      for (const d of dots) {
        if (!reduceMotion) d.x += d.v * s;
        const color = TIER_COLORS[d.tier];
        ctx!.save();
        ctx!.shadowColor = color;
        ctx!.shadowBlur = d.tier === 'hot' ? 12 : 7;
        ctx!.fillStyle = color;
        ctx!.globalAlpha = 0.92;
        ctx!.beginPath();
        ctx!.arc(d.x, d.y, d.r, 0, 6.2832);
        ctx!.fill();
        ctx!.restore();

        if (!reduceMotion && d.tier === 'hot' && !d.landed && d.x >= W - 26) {
          d.landed = true;
          pulses.push({ x: Math.min(d.x, W - 8), y: d.y, r: 4, a: 1 });
        }
      }
      for (let i = dots.length - 1; i >= 0; i--) {
        if (dots[i].x > W + 16) dots.splice(i, 1);
      }

      for (const p of pulses) {
        p.r += s * 46;
        p.a -= s * 1.4;
        ctx!.save();
        ctx!.globalAlpha = Math.max(p.a, 0);
        ctx!.strokeStyle = '#34d399';
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx!.stroke();
        ctx!.restore();
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (pulses[i].a <= 0) pulses.splice(i, 1);
      }
    }

    function frame(t: number) {
      if (!running) return;
      const dt = lastT === 0 ? 16 : t - lastT;
      lastT = t;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        running = true;
        lastT = 0;
        raf = requestAnimationFrame(frame);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      // single static frame: scatter dots across the canvas
      for (let i = 0; i < 10; i++) {
        spawn();
        dots[i].x = Math.random() * W;
      }
      draw(16);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[64px] w-full"
      data-component="lead-stream"
    />
  );
}
