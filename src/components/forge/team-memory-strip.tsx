"use client";

import { FORGE_LEDGER_UPDATED } from "@/lib/forge-events";
import type { Locale } from "@/types/forge";
import { Brain, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type MemoryEntry = {
  id: string;
  type: string;
  claim: string;
  tags: string[];
};

const COPY = {
  en: {
    title: "Team memory",
    empty: "Pin replies or Explore → log to activate memory",
    active: "Injected into every chat turn",
  },
  zh: {
    title: "团队记忆",
    empty: "固定回复或探索记录以激活记忆",
    active: "已注入每次对话",
  },
} as const;

export function TeamMemoryStrip({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data: { entries?: MemoryEntry[] }) => {
        setEntries(data.entries ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onUpdate = () => load();
    window.addEventListener(FORGE_LEDGER_UPDATED, onUpdate);
    return () => window.removeEventListener(FORGE_LEDGER_UPDATED, onUpdate);
  }, [load]);

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 text-[10px] text-white/30">
        <Loader2 className="size-3 animate-spin" />
        {t.title}…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 text-[10px] text-white/30">
        <Brain className="size-3 text-violet-300/60" />
        {t.empty}
      </div>
    );
  }

  return (
    <div className="border-b border-white/5 px-4 py-2">
      <div className="mb-1.5 flex items-center gap-2 text-[10px] text-violet-300/70">
        <Brain className="size-3" />
        <span className="font-medium uppercase tracking-wider">{t.title}</span>
        <span className="text-white/25">· {t.active}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {entries.slice(0, 4).map((entry) => (
          <div
            key={entry.id}
            className="min-w-[12rem] max-w-[16rem] shrink-0 rounded-lg border border-violet-400/15 bg-violet-500/[0.06] px-2.5 py-1.5"
            title={entry.claim}
          >
            <p className="truncate text-[10px] text-white/55">{entry.claim}</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-white/25">
              {entry.type}
              {entry.tags.includes("pinned") ? " · pinned" : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}