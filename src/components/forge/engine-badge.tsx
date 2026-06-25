"use client";

import {
  formatEngineDisplay,
  PROVIDER_STYLES,
  type EngineProvider,
} from "@/lib/engine-status";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";

type EngineBadgeProps = {
  provider?: EngineProvider | string;
  model?: string;
  fallback?: boolean;
  locale?: Locale;
  className?: string;
};

const COPY = {
  en: { fallback: "Ollama fallback" },
  zh: { fallback: "Ollama 回退" },
} as const;

export function EngineBadge({
  provider,
  model,
  fallback = false,
  locale = "en",
  className,
}: EngineBadgeProps) {
  if (!provider || !model || provider === "offline") return null;

  const normalized =
    provider === "xai" ? "xai" : provider === "ollama" ? "ollama" : null;
  if (!normalized) return null;

  const t = COPY[locale];
  const display = formatEngineDisplay(normalized, model);

  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide",
          PROVIDER_STYLES[normalized],
        )}
      >
        {display}
      </span>
      {fallback && (
        <span className="rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] uppercase tracking-wide text-amber-300/80">
          {t.fallback}
        </span>
      )}
    </div>
  );
}