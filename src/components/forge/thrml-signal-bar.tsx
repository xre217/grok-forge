"use client";

import { ThrmlEngineBadge } from "@/components/forge/thrml-engine-badge";
import { ThrmlSetupHint } from "@/components/forge/thrml-setup-hint";
import type { ThrmlSignal } from "@/lib/thrml-types";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";

type ThrmlSignalBarProps = {
  signal: ThrmlSignal | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  locale: Locale;
  collapsed?: boolean;
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

const COPY = {
  en: {
    empty: "Send a message to generate the THRML signal…",
    stale: "Showing last signal",
    retry: "Retry",
    isingLive: "JAX Ising sampler active",
  },
  zh: {
    empty: "发送消息以生成 THRML 信号…",
    stale: "显示上次信号",
    retry: "重试",
    isingLive: "JAX Ising 采样器已启用",
  },
} as const;

export function ThrmlSignalBar({
  signal,
  loading,
  error,
  onRetry,
  locale,
  collapsed = false,
}: ThrmlSignalBarProps) {
  const t = COPY[locale];
  const isIsing = Boolean(
    signal?.using_thrml && signal.engine === "thrml-ising",
  );

  return (
    <div
      className={cn(
        "forge-glass mb-4 rounded-2xl px-4 py-3",
        collapsed && "py-2",
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2",
          !collapsed && "mb-3",
        )}
      >
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-[var(--forge-gold)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--forge-gold-dim)]">
            THRML
          </span>
          {loading && <Loader2 className="size-3 animate-spin text-white/30" />}
        </div>

        {signal && (
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-[10px] text-amber-200/55">{t.stale}</span>
            )}
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                MODE_COLORS[signal.mode] ?? MODE_COLORS.observe,
              )}
            >
              {signal.mode}
            </span>
            <ThrmlEngineBadge signal={signal} />
          </div>
        )}
      </div>

      {!collapsed && signal && isIsing && (
        <p className="mb-3 text-[10px] text-emerald-300/65">{t.isingLive}</p>
      )}

      {!collapsed && signal && !signal.using_thrml && (
        <ThrmlSetupHint
          signal={signal}
          locale={locale}
          className={cn("mb-3", error && "opacity-60")}
        />
      )}

      {!collapsed && error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2"
        >
          <div className="flex min-w-0 items-start gap-2">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-rose-300" />
            <p className="text-xs leading-relaxed text-rose-100/85">{error}</p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-rose-300/20 px-2 py-1 text-[10px] font-medium text-rose-100/80 transition-colors hover:bg-rose-500/15 disabled:opacity-40"
            >
              <RotateCcw className="size-3" />
              {t.retry}
            </button>
          )}
        </div>
      )}

      {!collapsed && signal ? (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-3 sm:grid-cols-3",
              error && "opacity-60",
            )}
          >
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
          <p
            className={cn(
              "mt-3 line-clamp-2 text-xs leading-relaxed text-white/55",
              error && "opacity-60",
            )}
          >
            {signal.recommendation}
          </p>
        </>
      ) : !collapsed && !error ? (
        <p className="text-xs text-white/35">{t.empty}</p>
      ) : null}
    </div>
  );
}