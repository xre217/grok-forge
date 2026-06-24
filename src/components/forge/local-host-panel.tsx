"use client";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/types/forge";
import { Cpu, HardDrive, Terminal } from "lucide-react";

type LocalStatus = {
  mode: string;
  localFirst: boolean;
  reasoner: { provider: string; model: string; models?: string[] };
  ledger: { path: string; total: number };
  hosting: { command: string; port: number };
};

const COPY = {
  en: {
    title: "Local Forge",
    subtitle: "Zero cloud credits. Zero Vercel. Runs on your machine.",
    run: "Production-like local server",
    stack: "Your stack",
  },
  zh: {
    title: "本地熔炉",
    subtitle: "零云积分。零 Vercel。在你的机器上运行。",
    run: "本地生产级服务器",
    stack: "你的技术栈",
  },
} as const;

export function LocalHostPanel({
  locale,
  status,
}: {
  locale: Locale;
  status: LocalStatus | null;
}) {
  const t = COPY[locale];

  return (
    <div className="forge-glass flex h-full flex-1 flex-col rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <HardDrive className="size-5 text-[var(--forge-gold)]" />
        <div>
          <h2 className="text-lg font-semibold text-[var(--forge-gold)]">
            {t.title}
          </h2>
          <p className="text-xs text-white/45">{t.subtitle}</p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <StatusRow
          icon={<Cpu className="size-3.5" />}
          label="Reasoner"
          value={
            status
              ? `${status.reasoner.provider} · ${status.reasoner.model}`
              : "…"
          }
        />
        <StatusRow
          icon={<Terminal className="size-3.5" />}
          label="Mode"
          value={status?.mode ?? "local"}
        />
        <StatusRow
          icon={<HardDrive className="size-3.5" />}
          label="Ledger"
          value={
            status
              ? `${status.ledger.total} entries`
              : "…"
          }
        />
      </div>

      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/30">
        {t.run}
      </p>
      <pre className="mb-6 rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-xs leading-relaxed text-[var(--forge-gold-dim)]">
{`cd ~/grok-forge
npm run forge:local
# → http://localhost:3847`}
      </pre>

      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-white/30">
        {t.stack}
      </p>
      <pre className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[10px] leading-relaxed text-white/40">
{`FORGE_MODE=local
OLLAMA_MODEL=llama3.2:3b
JARVIS_HOME=~/.jarvis`}
      </pre>

      <Button
        className="mt-6 rounded-full bg-[var(--forge-gold)] text-black hover:bg-[var(--forge-gold-dim)]"
        onClick={() => {
          void navigator.clipboard.writeText("npm run forge:local");
        }}
      >
        Copy run command
      </Button>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-white/45">
        <span className="text-[var(--forge-gold-dim)]">{icon}</span>
        {label}
      </span>
      <span className="font-mono text-xs text-[var(--forge-gold-dim)]">
        {value}
      </span>
    </div>
  );
}