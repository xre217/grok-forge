"use client";

import { FeatureCards } from "@/components/forge/feature-cards";
import { MagneticButton } from "@/components/forge/magnetic-button";
import {
  FORGE,
  FORGE_DEMO_URL,
  FORGE_GITHUB_URL,
  FORGE_STEPS,
  FORGE_USE_CASES,
  ROUTES,
} from "@/lib/constants";
import confetti from "canvas-confetti";
import { ArrowRight, BookOpen, GitBranch } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const celebrate = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#d4af37", "#b8860b", "#fff4b8", "#ffffff"],
    });
  };

  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center px-6 py-16">
      <div className="forge-glass w-full max-w-3xl rounded-3xl p-8 text-center sm:p-10">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[var(--forge-gold-dim)]">
          {FORGE.project}
        </p>
        <h1 className="mb-4 bg-gradient-to-b from-[var(--forge-gold)] to-[var(--forge-gold-dim)] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          {FORGE.name}
        </h1>
        <p className="mx-auto mb-4 max-w-xl text-lg leading-relaxed text-white/70">
          {FORGE.tagline}
        </p>
        <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-white/45">
          A personal AI workspace on your computer — chat, save what matters,
          export everything. Like a workshop in your garage, not a rented desk
          in the cloud.
        </p>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {FORGE_USE_CASES.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton asChild strength={0.38}>
            <Link
              href={ROUTES.studio}
              onClick={celebrate}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--forge-gold)] px-8 text-sm font-semibold text-black transition-colors hover:bg-[var(--forge-gold-dim)]"
            >
              Open Studio
              <ArrowRight className="size-4" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild strength={0.22}>
            <a
              href={FORGE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <GitBranch className="size-4" />
              GitHub
            </a>
          </MagneticButton>
          <MagneticButton asChild strength={0.18}>
            <a
              href={FORGE_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-6 text-sm font-medium text-white/60 transition-colors hover:text-white/90"
            >
              <BookOpen className="size-4" />
              Self-host guide
            </a>
          </MagneticButton>
        </div>
      </div>

      <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {FORGE_STEPS.map((item) => (
          <div
            key={item.step}
            className="forge-glass rounded-2xl p-4 text-left"
          >
            <span className="text-xs font-mono text-[var(--forge-gold)]/80">
              {item.step}
            </span>
            <h2 className="mt-1 text-sm font-semibold text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-white/45">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <FeatureCards />

      <p className="mt-10 text-center text-[11px] text-white/25">
        MIT · fork freely ·{" "}
        <a
          href={FORGE_DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/40 underline-offset-2 hover:text-white/60 hover:underline"
        >
          DEMO.md
        </a>{" "}
        for Docker & VPS
      </p>
    </main>
  );
}