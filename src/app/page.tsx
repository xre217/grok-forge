import { GoldParticleCanvas } from "@/components/forge/gold-particle-canvas";
import { HeroSection } from "@/components/forge/hero-section";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--forge-void)]">
      <GoldParticleCanvas className="opacity-90" particleCount={140} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--forge-arc)" }}
      />
      <HeroSection />
    </div>
  );
}