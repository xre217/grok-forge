"use client";

import type { ThrmlSignal } from "@/lib/thrml";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Loader2, Zap } from "lucide-react";

type ThrmlSignalBarProps = {
  signal: ThrmlSignal | null;
  loading?: boolean;
  locale: Locale;
};

const SCORE_META = {
  urgency: {
    en: "Urgency",
    zh: "紧迫",
    color: "from-[var(--forge-gold)] to-amber-500",
    glow: "shadow-[0_0_12px_rgba(212,175,55,0.45)]",
  },
  uncertainty: {
    en: "Uncertainty",
    zh: "不确定",
    color: "from-violet-400 to-indigo-500",
    glow: "shadow-[0_0_12px_rgba(139,92,246,0.35)]",
  },
  exploration: {
    en: "Exploration",
    zh: "探索",
    color: "from-emerald-400 to-[var(--forge-gold-dim)]",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.35)]",
  },
} as const;

const MODE_COLORS: Record<string, string> = {
  observe: "text-sky-300 border-sky-400/30 bg-sky-500/10",
  plan: "text-[var(--forge-gold)] border-[var(--forge-gold)]/30 bg-[var(--forge-gold)]/10",
  execute: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  verify: "text-violet-300 border-violet-400/30 bg-violet-500/10",
};

export function ThrmlSignalBar({
  signal,
  loading,
  locale,
}: ThrmlSignalBarProps) {
  return (
    <div className="forge-glass mb-4 rounded-2xl px-4 py-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-[var(--forge-gold)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--forge-gold-dim)]">
            THRML
          </span>
          {loading && <Loader2 className="size-3 animate-spin text-white/30" />}
        </div>

        {signal && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                MODE_COLORS[signal.mode] ?? MODE_COLORS.observe,
              )}
            >
              {signal.mode}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/35">
              <Zap className="size-3" />
              {signal.using_thrml ? "ising" : "fallback"}
            </span>
          </div>
        )}
      </div>

      {signal ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(Object.keys(SCORE_META) as Array<keyof typeof SCORE_META>).map(
              (key) => {
                const meta = SCORE_META[key];
                const value = signal.scores[key];
                return (
                  <div key={key}>
                    <div className="mb-1.5 flex justify-between text-[10px] text-white/45">
                      <span>{locale === "zh" ? meta.zh : meta.en}</span>
                      <span className="font-mono text-white/60">
                        {value.toFixed(3)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          meta.color,
                          meta.glow,
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(value * 100, 100)}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/55">
            {signal.recommendation}
          </p>
        </>
      ) : (
        <p className="text-xs text-white/35">
          {locale === "zh"
            ? "发送消息以生成 THRML 信号…"
            : "Send a message to generate the THRML signal…"}
        </p>
      )}
    </div>
  );
}