import { GoldParticleCanvas } from "@/components/forge/gold-particle-canvas";
import { Button } from "@/components/ui/button";
import { FORGE, ROUTES } from "@/lib/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--forge-void)]">
      <GoldParticleCanvas className="opacity-90" particleCount={140} />

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--forge-arc)" }}
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="forge-glass max-w-2xl rounded-3xl p-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[var(--forge-gold-dim)]">
            {FORGE.project}
          </p>
          <h1 className="mb-4 bg-gradient-to-b from-[var(--forge-gold)] to-[var(--forge-gold-dim)] bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            {FORGE.name}
          </h1>
          <p className="mb-8 text-lg text-white/60">{FORGE.tagline}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="pointer-events-auto rounded-full bg-[var(--forge-gold)] px-8 font-semibold text-black hover:bg-[var(--forge-gold-dim)]"
            >
              <Link href={ROUTES.studio}>Enter the Forge</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="pointer-events-auto rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}