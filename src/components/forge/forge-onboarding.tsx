"use client";

import {
  dismissOnboarding,
  isOnboardingComplete,
  isOnboardingDismissed,
  loadOnboardingProgress,
  saveOnboardingProgress,
  type OnboardingProgress,
} from "@/lib/forge-onboarding-progress";
import { CHAT_STORAGE_KEY } from "@/lib/session-export";
import {
  FORGE_CHAT_SENT,
  FORGE_LEDGER_UPDATED,
} from "@/lib/forge-events";
import type { Locale } from "@/types/forge";
import { Check, Circle, Telescope, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const COPY = {
  en: {
    title: "Activate your Forge",
    subtitle: "Three steps — then memory shapes every reply.",
    steps: {
      chat: "Say hello — send your first message",
      save: "Save an insight — pin a reply or log an Explore mission",
      live: "Memory live — team memory injected into chat",
    },
    explore: "Open Explore",
    dismiss: "Skip for now",
    done: "You're set — memory loop active",
  },
  zh: {
    title: "激活你的熔炉",
    subtitle: "三步完成——之后记忆将塑造每次回复。",
    steps: {
      chat: "打个招呼——发送第一条消息",
      save: "保存见解——固定回复或记录探索任务",
      live: "记忆生效——团队记忆已注入对话",
    },
    explore: "打开探索",
    dismiss: "暂时跳过",
    done: "就绪——记忆循环已激活",
  },
} as const;

type ForgeOnboardingProps = {
  locale: Locale;
  onOpenExplore?: () => void;
};

function StepRow({
  done,
  label,
  action,
}: {
  done: boolean;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      {done ? (
        <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
      ) : (
        <Circle className="mt-0.5 size-3.5 shrink-0 text-white/25" />
      )}
      <span className={done ? "text-white/45 line-through" : "text-white/65"}>
        {label}
      </span>
      {!done && action ? <span className="ml-1">{action}</span> : null}
    </li>
  );
}

export function ForgeOnboarding({ locale, onOpenExplore }: ForgeOnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress>(
    loadOnboardingProgress,
  );
  const t = COPY[locale];

  const syncMemory = useCallback(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        const count = data.count ?? 0;
        if (count > 0) {
          setProgress(
            saveOnboardingProgress({
              memoryActive: true,
              memorySaved: true,
            }),
          );
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (isOnboardingDismissed()) return;

    let current = loadOnboardingProgress();
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          messages?: Array<{ role: string }>;
        };
        if (parsed.messages?.some((m) => m.role === "user")) {
          current = saveOnboardingProgress({ chatted: true });
        }
      }
    } catch {
      // ignore
    }

    setProgress(current);
    if (!isOnboardingComplete(current)) setVisible(true);
    syncMemory();
  }, [syncMemory]);

  useEffect(() => {
    const onChat = () => {
      setProgress(saveOnboardingProgress({ chatted: true }));
    };
    const onLedger = () => {
      setProgress(saveOnboardingProgress({ memorySaved: true }));
      syncMemory();
    };

    window.addEventListener(FORGE_CHAT_SENT, onChat);
    window.addEventListener(FORGE_LEDGER_UPDATED, onLedger);
    return () => {
      window.removeEventListener(FORGE_CHAT_SENT, onChat);
      window.removeEventListener(FORGE_LEDGER_UPDATED, onLedger);
    };
  }, [syncMemory]);

  useEffect(() => {
    if (isOnboardingComplete(progress)) {
      const timer = window.setTimeout(() => setVisible(false), 2400);
      return () => window.clearTimeout(timer);
    }
  }, [progress]);

  if (!visible) return null;

  const complete = isOnboardingComplete(progress);

  const dismiss = () => {
    dismissOnboarding();
    setVisible(false);
  };

  return (
    <div className="forge-glass mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[var(--forge-gold)]/15 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[var(--forge-gold)]">
          {complete ? t.done : t.title}
        </p>
        {!complete && (
          <p className="mt-0.5 text-[10px] text-white/35">{t.subtitle}</p>
        )}
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
          <StepRow done={progress.chatted} label={t.steps.chat} />
          <StepRow
            done={progress.memorySaved}
            label={t.steps.save}
            action={
              onOpenExplore ? (
                <button
                  type="button"
                  onClick={onOpenExplore}
                  className="inline-flex items-center gap-0.5 text-[10px] text-violet-300/80 hover:text-violet-200"
                >
                  <Telescope className="size-3" />
                  {t.explore}
                </button>
              ) : undefined
            }
          />
          <StepRow done={progress.memoryActive} label={t.steps.live} />
        </ul>
      </div>
      {!complete && (
        <button
          type="button"
          onClick={dismiss}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
        >
          {t.dismiss}
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}