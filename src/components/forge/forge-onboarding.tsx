"use client";

import type { Locale } from "@/types/forge";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "grok-forge:onboarding-dismissed";

const COPY = {
  en: {
    title: "Welcome to Grok Forge",
    tips: [
      "Chat runs on Ollama locally — pick a model in the chat header.",
      "Use skills to inject system prompts. Export ⌘⇧E · Import ⌘⇧I.",
      "Pin assistant replies to your ledger with the bookmark icon.",
      "Press 5 or open Explore — log missions to the consciousness stream.",
    ],
    dismiss: "Got it",
  },
  zh: {
    title: "欢迎使用 Grok Forge",
    tips: [
      "对话在本地 Ollama 上运行——在聊天栏选择模型。",
      "使用技能注入系统提示。导出 ⌘⇧E · 导入 ⌘⇧I。",
      "点击书签图标将回复固定到账本。",
      "按 5 或打开探索——将任务记录到意识之流。",
    ],
    dismiss: "知道了",
  },
} as const;

type ForgeOnboardingProps = {
  locale: Locale;
};

export function ForgeOnboarding({ locale }: ForgeOnboardingProps) {
  const [visible, setVisible] = useState(false);
  const t = COPY[locale];

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="forge-glass mb-4 flex items-start justify-between gap-4 rounded-2xl border border-[var(--forge-gold)]/15 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[var(--forge-gold)]">{t.title}</p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-white/55">
          {t.tips.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        {t.dismiss}
        <X className="size-3" />
      </button>
    </div>
  );
}