"use client";

import type { MemoryCitation } from "@/lib/team-memory";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";

const COPY = {
  en: { label: "Shaped by" },
  zh: { label: "记忆来源" },
} as const;

type MemoryCitationChipsProps = {
  citations: MemoryCitation[];
  locale: Locale;
  max?: number;
  className?: string;
};

function chipLabel(citation: MemoryCitation): string {
  const pin = citation.tags.includes("pinned") ? " · pinned" : "";
  const mission = citation.tags.find((t) => t.startsWith("mission:"));
  const missionShort = mission
    ? ` · ${mission.slice("mission:".length).slice(0, 12)}`
    : "";
  return `${citation.type}${pin}${missionShort}`;
}

export function MemoryCitationChips({
  citations,
  locale,
  max = 4,
  className,
}: MemoryCitationChipsProps) {
  if (!citations.length) return null;

  const t = COPY[locale];
  const visible = citations.slice(0, max);
  const overflow = citations.length - visible.length;

  return (
    <div className={cn("mt-2", className)}>
      <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-violet-300/45">
        {t.label} ({citations.length})
      </p>
      <div className="flex flex-wrap gap-1">
        {visible.map((citation) => (
          <span
            key={citation.id}
            title={citation.claim}
            className="max-w-[11rem] truncate rounded-md border border-violet-400/20 bg-violet-500/[0.08] px-2 py-0.5 text-[9px] text-violet-100/70"
          >
            <span className="font-mono uppercase text-violet-300/60">
              {chipLabel(citation)}
            </span>
            <span className="text-white/35"> — </span>
            {citation.claim}
          </span>
        ))}
        {overflow > 0 && (
          <span className="rounded-md border border-white/10 px-2 py-0.5 text-[9px] text-white/30">
            +{overflow}
          </span>
        )}
      </div>
    </div>
  );
}