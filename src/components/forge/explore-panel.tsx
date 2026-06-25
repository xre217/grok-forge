"use client";

import { ConsciousnessStream } from "@/components/forge/consciousness-stream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { emitLedgerUpdated } from "@/lib/forge-events";
import {
  DOMAIN_META,
  EXPLORATION_MISSIONS,
  type ExplorationMission,
} from "@/lib/explorations";
import type { ThrmlSignal } from "@/lib/thrml";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { Loader2, Rocket, Sparkles, Telescope } from "lucide-react";
import { useState } from "react";

type ExplorePanelProps = {
  locale: Locale;
  thrml?: ThrmlSignal | null;
  onDiscuss?: (mission: ExplorationMission, seed: string) => void;
  model?: string;
};

const COPY = {
  en: {
    title: "Explore",
    subtitle:
      "Expand consciousness. Map the cosmos. Log what the team discovers — together.",
    reflection: "Your reflection",
    placeholder: "What are you noticing, wondering, or ready to build toward the stars?",
    log: "Distill & log",
    discuss: "Discuss in chat",
    logged: "Logged to consciousness stream",
    failed: "Exploration failed — is Ollama running?",
    explorationHigh: "THRML signals high exploration — good time to voyage.",
  },
  zh: {
    title: "探索",
    subtitle: "扩展意识。描绘宇宙。记录团队共同发现。",
    reflection: "你的反思",
    placeholder: "你正在注意、好奇、或准备向星辰建造什么？",
    log: "提炼并记录",
    discuss: "在对话中讨论",
    logged: "已写入意识之流",
    failed: "探索失败——Ollama 是否在运行？",
    explorationHigh: "THRML 探索信号偏高——适合启航。",
  },
} as const;

export function ExplorePanel({
  locale,
  thrml,
  onDiscuss,
  model,
}: ExplorePanelProps) {
  const t = COPY[locale];
  const [activeMission, setActiveMission] = useState<ExplorationMission>(
    EXPLORATION_MISSIONS[0],
  );
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastObservation, setLastObservation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const explorationHigh =
    (thrml?.scores.exploration ?? 0) > 0.55 ||
    thrml?.mode === "observe" ||
    thrml?.mode === "plan";

  const distill = async () => {
    const text = reflection.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reflection: text,
          missionId: activeMission.id,
          locale,
          model,
        }),
      });

      const data = (await res.json()) as {
        observation?: string;
        error?: string;
      };

      if (!res.ok || !data.observation) {
        throw new Error(data.error ?? t.failed);
      }

      setLastObservation(data.observation);
      setReflection("");
      emitLedgerUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-glass flex h-full min-h-0 flex-1 flex-col rounded-2xl">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <Telescope className="size-5 text-sky-300" />
          <div>
            <h2 className="text-lg font-semibold text-[var(--forge-gold)]">
              {t.title}
            </h2>
            <p className="text-xs text-white/45">{t.subtitle}</p>
          </div>
        </div>
        {explorationHigh && thrml && (
          <p className="mt-3 flex items-center gap-1.5 text-[10px] text-sky-300/80">
            <Sparkles className="size-3" />
            {t.explorationHigh}
            <span className="font-mono text-white/30">
              ({thrml.scores.exploration.toFixed(2)})
            </span>
          </p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5">
        <ConsciousnessStream locale={locale} />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORATION_MISSIONS.map((mission) => {
            const meta = DOMAIN_META[mission.domain];
            const active = activeMission.id === mission.id;
            return (
              <button
                key={mission.id}
                type="button"
                onClick={() => setActiveMission(mission)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-sky-400/30 bg-sky-500/10 shadow-[0_0_24px_rgba(56,189,248,0.08)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10",
                )}
              >
                <span
                  className={cn(
                    "mb-2 inline-block rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-medium text-white/90",
                    meta.color,
                  )}
                >
                  {locale === "zh" ? meta.zh : meta.en}
                </span>
                <p className="text-sm font-medium text-white">
                  {locale === "zh" ? mission.titleZh : mission.title}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                  {locale === "zh" ? mission.questionZh : mission.question}
                </p>
              </button>
            );
          })}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-white/50">{t.reflection}</p>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
            className="resize-none border-white/10 bg-white/5 text-white placeholder:text-white/25"
          />
        </div>

        {lastObservation && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100/85">
            <span className="font-medium">{t.logged}:</span> {lastObservation}
          </div>
        )}

        {error && (
          <p className="text-xs text-rose-300/85">{error}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={loading || !reflection.trim()}
            className="rounded-full bg-sky-500 text-white hover:bg-sky-400"
            onClick={() => void distill()}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            {t.log}
          </Button>
          {onDiscuss && (
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 text-white/70"
              onClick={() =>
                onDiscuss(
                  activeMission,
                  reflection.trim() ||
                    (locale === "zh"
                      ? activeMission.questionZh
                      : activeMission.question),
                )
              }
            >
              {t.discuss}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}