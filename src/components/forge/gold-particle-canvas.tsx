"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkle: number;
};

export type GoldParticleCanvasProps = {
  className?: string;
  particleCount?: number;
  /** 0–1 — how strongly particles drift toward the cursor */
  magnetism?: number;
  /** Gold intensity multiplier for bloom */
  glow?: number;
};

const GOLD = {
  core: "rgba(212, 175, 55, 1)",
  mid: "rgba(184, 134, 11, 0.85)",
  halo: "rgba(255, 215, 100, 0.35)",
  spark: "rgba(255, 240, 180, 0.9)",
} as const;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 1.6 + 0.4,
    alpha: Math.random() * 0.55 + 0.25,
    twinkle: Math.random() * Math.PI * 2,
  };
}

/**
 * Signature Tre canvas — gold particle field with magnetic cursor drift.
 * The Arc Reactor heartbeat of Grok Forge.
 */
export function GoldParticleCanvas({
  className,
  particleCount = 120,
  magnetism = 0.018,
  glow = 1,
}: GoldParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const count = reduced ? Math.floor(particleCount * 0.35) : particleCount;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: count }, () =>
        createParticle(width, height),
      );
    };

    const drawParticle = (p: Particle, time: number) => {
      const pulse = reduced
        ? p.alpha
        : p.alpha * (0.72 + Math.sin(time * 0.002 + p.twinkle) * 0.28);

      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.radius * 4 * glow,
      );
      gradient.addColorStop(0, GOLD.spark);
      gradient.addColorStop(0.35, GOLD.core.replace("1)", `${pulse})`));
      gradient.addColorStop(0.7, GOLD.mid.replace("0.85)", `${pulse * 0.6})`));
      gradient.addColorStop(1, GOLD.halo.replace("0.35)", "0)"));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 3 * glow, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const { x: px, y: py, active } = pointerRef.current;

      for (const p of particles) {
        if (active && !reduced) {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          const force = Math.min(magnetism * (180 / dist), 0.12);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;

        drawParticle(p, time);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [glow, magnetism, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-auto absolute inset-0 h-full w-full",
        className,
      )}
    />
  );
}