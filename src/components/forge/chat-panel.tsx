"use client";

import { LedgerPanel } from "@/components/forge/ledger-panel";
import { LocalHostPanel } from "@/components/forge/local-host-panel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useForgeChat } from "@/hooks/use-forge-chat";
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
  chatReloadKey?: number;
  onSend?: (message: string) => void;
  onResetChat?: () => void;
};

type ForgeStatus = {
  mode: string;
  localFirst: boolean;
  reasoner: { provider: string; model: string };
  ollama: { available: boolean };
  ledger: { path: string; total: number };
  hosting: { command: string; port: number };
  grok: { configured: boolean; active: boolean };
};

const COPY = {
  en: {
    placeholder: "Build with the Local Forge…",
    greeting:
      "Local Forge online — Ollama on your machine, ledger as constitution. No cloud credits needed. What are we building?",
    skills: "Skills library active. Pick a skill to inject its system prompt.",
    thinking: "Reasoning locally…",
    error: "Local reasoner failed. Is Ollama running?",
    chat: "Local Chat",
    live: "LOCAL",
  },
  zh: {
    placeholder: "与本地熔炉一起构建…",
    greeting:
      "本地熔炉已上线——Ollama 在本地运行，账本即宪法。无需云积分。我们要建造什么？",
    skills: "技能库已激活。选择技能以注入系统提示。",
    thinking: "本地推理中…",
    error: "本地推理失败。Ollama 是否在运行？",
    chat: "本地对话",
    live: "本地",
  },
} as const;

export function ChatPanel({
  locale,
  activePanel,
  activeSkill,
  skillPrompt,
  chatReloadKey = 0,
  onSend,
  onResetChat,
}: ChatPanelProps) {
  const t = COPY[locale];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ForgeStatus | null>(null);
  const { messages, setMessages, resetChat } = useForgeChat(
    locale,
    t.greeting,
    chatReloadKey,
  );
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
  }, [skillPrompt, activeSkill, locale, setMessages]);

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
          messages: history
            .filter((m) => m.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
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

      const reply = data.message ?? data.error ?? t.error;
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
    return <LedgerPanel locale={locale} />;
  }

  if (activePanel === "deploy") {
    return <LocalHostPanel locale={locale} status={status} />;
  }

  if (activePanel === "skills" && !activeSkill) {
    return (
      <PanelShell title={locale === "zh" ? "技能库" : "Skills"}>
        <p className="text-white/50">{t.skills}</p>
      </PanelShell>
    );
  }

  const isLive =
    status?.localFirst && status?.ollama?.available;

  return (
    <div className="forge-glass flex h-full min-h-0 flex-1 flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--forge-gold)]" />
          <span className="text-sm font-medium text-white">{t.chat}</span>
          {isLive && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
              {t.live}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeSkill && (
            <span className="text-xs text-[var(--forge-gold-dim)]">
              {activeSkill}
            </span>
          )}
          {onResetChat && (
            <button
              type="button"
              onClick={() => {
                resetChat(t.greeting);
                onResetChat();
              }}
              className="text-[10px] text-white/30 hover:text-white/60"
            >
              {locale === "zh" ? "清除" : "clear"}
            </button>
          )}
        </div>
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