"use client";

import { HoverCard3D } from "@/components/forge/hover-card-3d";
import { FORGE_FEATURES } from "@/lib/constants";
import { Sparkles, Zap, Globe, Keyboard } from "lucide-react";

const ICONS = {
  sparkles: Sparkles,
  zap: Zap,
  globe: Globe,
  keyboard: Keyboard,
} as const;

export function FeatureCards() {
  return (
    <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      {FORGE_FEATURES.map((feature) => {
        const Icon = ICONS[feature.icon];
        return (
          <HoverCard3D key={feature.title} className="group">
            <div className="forge-glass h-full rounded-2xl p-5 text-left transition-shadow duration-300 group-hover:shadow-[0_0_40px_var(--forge-gold-glow)]">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--forge-gold)]/15 text-[var(--forge-gold)]">
                <Icon className="size-4" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">
                {feature.description}
              </p>
            </div>
          </HoverCard3D>
        );
      })}
    </div>
  );
}