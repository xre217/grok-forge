"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { FORGE_DOMAIN } from "@/lib/constants";
import type { Locale, StudioPanel } from "@/types/forge";
import { cn } from "@/lib/utils";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
  skillPrompt?: string;
  onSend?: (message: string) => void;
};

type ForgeStatus = {
  grok: { configured: boolean; model: string };
  ollama: { available: boolean };
  domain: string;
};

const COPY = {
  en: {
    placeholder: "Ask Grok anything…",
    greeting:
      "Forge online. I'm your JARVIS-class co-pilot — maximum truth, zero corporate filter. What shall we build?",
    ledger: "Evidence Ledger view — connect your ~/.jarvis constitution here.",
    deploy: "Production deploy target. Wire DNS once Vercel billing is active.",
    skills: "Skills library active. Pick a skill to inject its system prompt.",
    thinking: "Grok is thinking…",
    error: "Connection failed. Check XAI_API_KEY or Ollama.",
  },
  zh: {
    placeholder: "问 Grok 任何问题…",
    greeting:
      "Forge 已上线。我是你的 JARVIS 级副驾驶——最大真实，零企业滤镜。我们要建造什么？",
    ledger: "证据账本视图——在此连接你的 ~/.jarvis 宪法。",
    deploy: "生产部署目标。Vercel 账单恢复后配置 DNS。",
    skills: "技能库已激活。选择技能以注入系统提示。",
    thinking: "Grok 思考中…",
    error: "连接失败。请检查 XAI_API_KEY 或 Ollama。",
  },
} as const;

export function ChatPanel({
  locale,
  activePanel,
  activeSkill,
  skillPrompt,
  onSend,
}: ChatPanelProps) {
  const t = COPY[locale];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ForgeStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: t.greeting },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSkillRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!skillPrompt || activeSkill === lastSkillRef.current) return;
    lastSkillRef.current = activeSkill;
    setMessages((prev) => [
      ...prev,
      {
        id: `skill-${Date.now()}`,
        role: "assistant",
        content: `${locale === "zh" ? "技能已加载" : "Skill loaded"}: ${skillPrompt}`,
      },
    ]);
  }, [skillPrompt, activeSkill, locale]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsLoading(true);
    onSend?.(text);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          locale,
          skillPrompt: activeSkill ? skillPrompt : undefined,
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        error?: string;
        provider?: string;
        model?: string;
      };

      const reply =
        data.message ??
        data.error ??
        (locale === "zh" ? t.error : t.error);

      const meta =
        data.provider && data.model
          ? `\n\n— ${data.provider}/${data.model}`
          : "";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `${reply}${meta}`,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: t.error },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (activePanel === "ledger") {
    return (
      <PanelShell title={locale === "zh" ? "证据账本" : "Evidence Ledger"}>
        <p className="text-white/50">{t.ledger}</p>
        <pre className="mt-4 rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs text-[var(--forge-gold-dim)]">
          ~/.jarvis/memory/ledger.jsonl
        </pre>
      </PanelShell>
    );
  }

  if (activePanel === "deploy") {
    return (
      <PanelShell title={locale === "zh" ? "部署" : "Deploy"}>
        <p className="text-white/50">{t.deploy}</p>
        <div className="mt-4 space-y-3 font-mono text-xs">
          <StatusRow
            label="Grok API"
            value={
              status?.grok.configured
                ? `key set · ${status.grok.model} (needs credits)`
                : "✗ XAI_API_KEY missing"
            }
          />
          <StatusRow
            label="Ollama"
            value={status?.ollama.available ? "✓ online" : "○ offline"}
          />
          <StatusRow label="GitHub" value="✓ xre217/grok-forge" />
          <StatusRow
            label="Domain"
            value={status?.domain ?? FORGE_DOMAIN}
          />
          <StatusRow label="Vercel" value="⏳ billing — update payment method" />
        </div>
        <pre className="mt-4 rounded-xl border border-white/5 bg-black/40 p-4 text-[10px] text-white/40">
{`# DNS at registrar (trefong.com)
CNAME  forge  →  cname.vercel-dns.com

# After billing cleared
./scripts/deploy-forge.sh`}
        </pre>
      </PanelShell>
    );
  }

  if (activePanel === "skills" && !activeSkill) {
    return (
      <PanelShell title={locale === "zh" ? "技能库" : "Skills"}>
        <p className="text-white/50">{t.skills}</p>
      </PanelShell>
    );
  }

  return (
    <div className="forge-glass flex h-full min-h-0 flex-1 flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--forge-gold)]" />
          <span className="text-sm font-medium text-white">
            {locale === "zh" ? "Grok 对话" : "Grok Chat"}
          </span>
          {status?.grok.configured && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
              LIVE
            </span>
          )}
        </div>
        {activeSkill && (
          <span className="text-xs text-[var(--forge-gold-dim)]">
            {activeSkill}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-[var(--forge-gold)]/20 text-white"
                  : "bg-white/5 text-white/75",
              )}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 className="size-4 animate-spin" />
              {t.thinking}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-white/5 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            rows={2}
            disabled={isLoading}
            className="min-h-0 resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            size="icon-lg"
            disabled={isLoading}
            className="shrink-0 rounded-xl bg-[var(--forge-gold)] text-black hover:bg-[var(--forge-gold-dim)]"
            onClick={() => void send()}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="forge-glass flex h-full flex-1 flex-col rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--forge-gold)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-white/50">
      <span>{label}</span>
      <span className="text-[var(--forge-gold-dim)]">{value}</span>
    </div>
  );
}