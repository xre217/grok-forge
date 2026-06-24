"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { Locale, StudioPanel } from "@/types/forge";
import { cn } from "@/lib/utils";
import { Send, Sparkles } from "lucide-react";
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

const COPY = {
  en: {
    placeholder: "Ask Grok anything…",
    greeting:
      "Forge online. I'm your JARVIS-class co-pilot — maximum truth, zero corporate filter. What shall we build?",
    empty: "Select a skill from the rail or start typing.",
    ledger: "Evidence Ledger view — connect your ~/.jarvis constitution here.",
    deploy: "Deploy panel — push to Vercel, wire env vars, go live.",
    skills: "Skills library active. Pick a skill to inject its system prompt.",
  },
  zh: {
    placeholder: "问 Grok 任何问题…",
    greeting:
      "Forge 已上线。我是你的 JARVIS 级副驾驶——最大真实，零企业滤镜。我们要建造什么？",
    empty: "从侧边栏选择技能，或直接输入。",
    ledger: "证据账本视图——在此连接你的 ~/.jarvis 宪法。",
    deploy: "部署面板——推送到 Vercel，配置环境变量，上线。",
    skills: "技能库已激活。选择技能以注入系统提示。",
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t.greeting,
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (skillPrompt) {
      setMessages((prev) => [
        ...prev,
        {
          id: `skill-${Date.now()}`,
          role: "assistant",
          content: `${locale === "zh" ? "技能已加载" : "Skill loaded"}: ${skillPrompt}`,
        },
      ]);
    }
  }, [skillPrompt, locale]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          locale === "zh"
            ? `收到："${text}"。Studio API 接入后即可获得完整 Grok 推理。`
            : `Acknowledged: "${text}". Wire the Studio API for full Grok reasoning.`,
      },
    ]);
    setInput("");
    onSend?.(text);
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
        <div className="mt-4 space-y-2 font-mono text-xs text-white/40">
          <p>vercel --prod</p>
          <p>gh repo create grok-forge --public --source=.</p>
        </div>
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
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-[var(--forge-gold)]/20 text-white"
                  : "bg-white/5 text-white/75",
              )}
            >
              {msg.content}
            </div>
          ))}
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
            className="min-h-0 resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button
            size="icon-lg"
            className="shrink-0 rounded-xl bg-[var(--forge-gold)] text-black hover:bg-[var(--forge-gold-dim)]"
            onClick={send}
            aria-label="Send message"
          >
            <Send className="size-4" />
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