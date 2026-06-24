import { GoldParticleCanvas } from "@/components/forge/gold-particle-canvas";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function StudioPage() {
  return (
    <div className="relative min-h-screen">
      <GoldParticleCanvas particleCount={80} magnetism={0.012} />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-3xl font-semibold text-[var(--forge-gold)]">
          Studio shell — coming online
        </h1>
        <p className="max-w-md text-center text-white/50">
          The Arc Reactor is lit. Next: chat surface, skills rail, magnetic
          panels, keyboard shortcuts.
        </p>
        <Link
          href={ROUTES.home}
          className="text-sm text-[var(--forge-gold-dim)] underline-offset-4 hover:underline"
        >
          ← Back to Forge
        </Link>
      </div>
    </div>
  );
}