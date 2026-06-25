"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Locale } from "@/types/forge";
import { BookOpen, Loader2 } from "lucide-react";
import { FORGE_LEDGER_UPDATED } from "@/lib/forge-events";
import { useCallback, useEffect, useState } from "react";

type LedgerEntry = {
  id: string;
  ts: string;
  type: string;
  claim: string;
  tags?: string[];
  confidence?: number;
};

type LedgerResponse = {
  path: string;
  stats: {
    total: number;
    sovereigntyTagged: number;
    newest: string | null;
  };
  entries: LedgerEntry[];
};

const COPY = {
  en: {
    title: "Evidence Ledger",
    subtitle: "Append-only local memory — pin chat replies or POST /api/ledger.",
    empty: "No entries yet. Pin a reply in chat or enable FORGE_LEDGER_ENABLED.",
    entries: "entries",
    sovereignty: "sovereignty-tagged",
  },
  zh: {
    title: "证据账本",
    subtitle: "只增不改的本地记忆——在对话中固定回复或 POST /api/ledger。",
    empty: "暂无条目。在对话中固定回复或启用 FORGE_LEDGER_ENABLED。",
    entries: "条",
    sovereignty: "主权标签",
  },
} as const;

export function LedgerPanel({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLedger = useCallback(() => {
    setLoading(true);
    fetch("/api/ledger?limit=20")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  useEffect(() => {
    const onUpdate = () => loadLedger();
    window.addEventListener(FORGE_LEDGER_UPDATED, onUpdate);
    return () => window.removeEventListener(FORGE_LEDGER_UPDATED, onUpdate);
  }, [loadLedger]);

  return (
    <div className="forge-glass flex h-full flex-1 flex-col rounded-2xl">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-[var(--forge-gold)]" />
          <h2 className="font-semibold text-[var(--forge-gold)]">{t.title}</h2>
        </div>
        <p className="mt-1 text-xs text-white/45">{t.subtitle}</p>
        {data && (
          <p className="mt-2 font-mono text-[10px] text-white/30">{data.path}</p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-white/40">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !data?.entries.length ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-white/40">
          {t.empty}
        </div>
      ) : (
        <>
          <div className="flex gap-4 border-b border-white/5 px-5 py-2 text-xs text-white/40">
            <span>
              {data.stats.total} {t.entries}
            </span>
            <span>
              {data.stats.sovereigntyTagged} {t.sovereignty}
            </span>
          </div>
          <ScrollArea className="flex-1 px-5 py-4">
            <div className="flex flex-col gap-3">
              {data.entries
                .slice()
                .reverse()
                .map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-5 bg-[var(--forge-gold)]/10 text-[10px] text-[var(--forge-gold-dim)]"
                      >
                        {entry.type}
                      </Badge>
                      <time className="text-[10px] text-white/30">
                        {entry.ts.slice(0, 19)}
                      </time>
                    </div>
                    <p className="text-sm leading-relaxed text-white/75">
                      {entry.claim}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/35"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}