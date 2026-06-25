"use client";

import { FeatureCards } from "@/components/forge/feature-cards";
import { MagneticButton } from "@/components/forge/magnetic-button";
import { FORGE, FORGE_GITHUB_URL, ROUTES } from "@/lib/constants";
import confetti from "canvas-confetti";
import { ArrowRight } from "lucide-react";
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
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="forge-glass max-w-2xl rounded-3xl p-10 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[var(--forge-gold-dim)]">
          {FORGE.project}
        </p>
        <h1 className="mb-4 bg-gradient-to-b from-[var(--forge-gold)] to-[var(--forge-gold-dim)] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
          {FORGE.name}
        </h1>
        <p className="mb-2 text-lg text-white/60">{FORGE.tagline}</p>
        <p className="mb-2 text-sm text-emerald-400/80">
          Local-first — Ollama on your machine. Optional memory. No cloud bill required.
        </p>
        <p className="mb-8 text-xs text-sky-300/70">
          Explore consciousness. Map the cosmos. Log discoveries as a team.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton asChild strength={0.38}>
            <Link
              href={ROUTES.studio}
              onClick={celebrate}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--forge-gold)] px-8 text-sm font-semibold text-black transition-colors hover:bg-[var(--forge-gold-dim)]"
            >
              Enter the Forge
              <ArrowRight className="size-4" />
            </Link>
          </MagneticButton>
          <MagneticButton asChild strength={0.22}>
            <a
              href={FORGE_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              View on GitHub
            </a>
          </MagneticButton>
        </div>
      </div>
      <FeatureCards />
    </main>
  );
}