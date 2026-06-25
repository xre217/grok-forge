"use client";

import { FORGE_GITHUB_URL } from "@/lib/constants";
import type { ThrmlSignal } from "@/lib/thrml-types";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { BookOpen, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

const THRML_DOC_URL = `${FORGE_GITHUB_URL}/blob/main/THRML.md`;

const SETUP_SNIPPET = `git clone https://github.com/extropic-ai/thrml.git ~/thrml
python3 -m venv .venv && source .venv/bin/activate
pip install jax jaxlib equinox
# .env.local
THRML_REPO_PATH=~/thrml
THRML_PYTHON=.venv/bin/python`;

const COPY = {
  en: {
    title: "Enable THRML Ising (JAX)",
    body: "Forge works without this — hash fallback drives the bar today. For real Ising sampling:",
    copy: "Copy setup",
    copied: "Copied",
    guide: "Full guide",
    reason: "Fallback reason",
  },
  zh: {
    title: "启用 THRML Ising（JAX）",
    body: "无此配置亦可运行——当前为哈希回退。启用真实 Ising 采样：",
    copy: "复制配置",
    copied: "已复制",
    guide: "完整指南",
    reason: "回退原因",
  },
} as const;

type ThrmlSetupHintProps = {
  signal: ThrmlSignal;
  locale: Locale;
  className?: string;
};

export function ThrmlSetupHint({
  signal,
  locale,
  className,
}: ThrmlSetupHintProps) {
  const t = COPY[locale];
  const [copied, setCopied] = useState(false);

  if (signal.using_thrml) return null;

  const copySetup = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-400/15 bg-amber-500/[0.07] px-3 py-2.5",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/85">
        {t.title}
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-amber-100/65">
        {t.body}
      </p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-white/5 bg-black/40 p-2 font-mono text-[9px] leading-relaxed text-amber-100/55">
        {SETUP_SNIPPET}
      </pre>
      {signal.reason && (
        <p className="mt-2 text-[9px] text-amber-100/45">
          <span className="font-medium">{t.reason}:</span> {signal.reason}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copySetup()}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300/20 px-2 py-1 text-[9px] font-medium text-amber-100/80 hover:bg-amber-500/10"
        >
          <Copy className="size-3" />
          {copied ? t.copied : t.copy}
        </button>
        <a
          href={THRML_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[9px] font-medium text-white/55 hover:text-white/75"
        >
          <BookOpen className="size-3" />
          {t.guide}
          <ExternalLink className="size-2.5 opacity-50" />
        </a>
      </div>
    </div>
  );
}