"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FORGE_LEDGER_UPDATED } from "@/lib/forge-events";
import type { Locale } from "@/types/forge";
import { Loader2, Orbit } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type StreamEntry = {
  id: string;
  ts: string;
  type: string;
  claim: string;
  tags?: string[];
};

const COPY = {
  en: {
    title: "Consciousness Stream",
    empty: "No explorations logged yet. Begin a mission below.",
    loading: "Tuning the stream…",
  },
  zh: {
    title: "意识之流",
    empty: "尚无探索记录。从下方任务开始。",
    loading: "正在调谐意识流…",
  },
} as const;

const STREAM_TAGS = new Set([
  "exploration",
  "consciousness",
  "cosmos",
  "universe",
  "collective",
  "starship",
  "team",
]);

export function ConsciousnessStream({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/ledger?limit=40")
      .then((r) => r.json())
      .then((data: { entries?: StreamEntry[] }) => {
        const filtered = (data.entries ?? []).filter(
          (e) =>
            e.type === "exploration" ||
            e.tags?.some((tag) => STREAM_TAGS.has(tag)),
        );
        setEntries(filtered.slice(-12).reverse());
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

  return (
    <div className="forge-glass rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <Orbit className="size-4 text-sky-300" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          {t.title}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-white/35">
          <Loader2 className="size-3.5 animate-spin" />
          {t.loading}
        </div>
      ) : entries.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-white/35">{t.empty}</p>
      ) : (
        <ScrollArea className="max-h-56">
          <div className="flex flex-col gap-2 p-3">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-sky-400/10 bg-sky-500/[0.04] px-3 py-2.5"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className="h-5 bg-sky-500/10 text-[10px] text-sky-300">
                    {entry.type}
                  </Badge>
                  <time className="text-[10px] text-white/25">
                    {entry.ts.slice(0, 19)}
                  </time>
                </div>
                <p className="text-xs leading-relaxed text-white/70">
                  {entry.claim}
                </p>
              </article>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}