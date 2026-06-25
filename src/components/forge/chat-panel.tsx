"use client";

import { ExplorePanel } from "@/components/forge/explore-panel";
import { TeamMemoryStrip } from "@/components/forge/team-memory-strip";
import { LedgerPanel } from "@/components/forge/ledger-panel";
import { LocalHostPanel } from "@/components/forge/local-host-panel";
import type { ExplorationMission } from "@/lib/explorations";
import type { ThrmlSignal } from "@/lib/thrml-types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { EngineBadge } from "@/components/forge/engine-badge";
import { MemoryCitationChips } from "@/components/forge/memory-citation-chips";
import { RuntimeStatusChip } from "@/components/forge/runtime-status-chip";
import { useForgeChat } from "@/hooks/use-forge-chat";
import { useForgeModel } from "@/hooks/use-forge-model";
import { useForgeStatus } from "@/hooks/use-forge-status";
import { emitChatSent } from "@/lib/forge-events";
import { pinToLedger } from "@/lib/ledger-client";
import type { MemoryCitation } from "@/lib/team-memory";
import type { Locale, StudioPanel } from "@/types/forge";
import { cn } from "@/lib/utils";
import { Bookmark, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  memoryInjected?: number;
  memoryUsed?: MemoryCitation[];
  engine?: {
    provider: "xai" | "ollama";
    model: string;
    fallback?: boolean;
  };
};

type ChatPanelProps = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
  skillPrompt?: string;
  chatReloadKey?: number;
  thrmlSignal?: ThrmlSignal | null;
  exploreDiscuss?: { mission: ExplorationMission; seed: string } | null;
  onExploreDiscuss?: (mission: ExplorationMission, seed: string) => void;
  onExploreDiscussConsumed?: () => void;
  onSend?: (message: string) => void;
  onResetChat?: () => void;
  onOpenExplore?: () => void;
  onBundleImported?: (detail: string) => void;
  onCompareBundles?: () => void;
};

const COPY = {
  en: {
    placeholder: "Build with the Local Forge…",
    greetingLocal:
      "Forge online — Ollama on your machine (not Grok cloud). Pick a skill or start building.",
    greetingHybrid:
      "Hybrid mode — tries Grok first, falls back to Ollama. Pin replies to build team memory.",
    greetingOffline:
      "Ollama offline. Run: ollama serve — then chat runs locally on your machine.",
    skills: "Skills library active. Pick a skill to inject its system prompt.",
    thinkingLocal: "Reasoning with Ollama…",
    thinkingHybrid: "Reasoning…",
    error: "Local reasoner failed. Is Ollama running?",
    chat: "Chat",
    model: "Model",
    pin: "Pin to ledger",
    pinned: "Pinned",
    pinFailed: "Ledger pin failed",
    memoriesActive: (n: number) =>
      n === 1 ? "1 memory active" : `${n} memories active`,
  },
  zh: {
    placeholder: "与本地熔炉一起构建…",
    greetingLocal:
      "熔炉已上线——Ollama 在本地运行（非 Grok 云端）。选择技能或直接开始。",
    greetingHybrid:
      "混合模式——优先 Grok，回退 Ollama。固定回复以建立团队记忆。",
    greetingOffline: "Ollama 离线。请运行：ollama serve",
    skills: "技能库已激活。选择技能以注入系统提示。",
    thinkingLocal: "Ollama 推理中…",
    thinkingHybrid: "推理中…",
    error: "本地推理失败。Ollama 是否在运行？",
    chat: "对话",
    model: "模型",
    pin: "固定到账本",
    pinned: "已固定",
    pinFailed: "账本写入失败",
    memoriesActive: (n: number) => `${n} 条记忆已注入`,
  },
} as const;

function resolveGreeting(
  locale: Locale,
  status: ReturnType<typeof useForgeStatus>,
): string {
  const t = COPY[locale];
  if (!status?.engine) return t.greetingLocal;
  if (status.engine.chip.variant === "offline") return t.greetingOffline;
  if (status.engine.chip.variant === "hybrid" || status.engine.chip.variant === "grok") {
    return t.greetingHybrid;
  }
  return t.greetingLocal;
}

function resolveThinking(
  locale: Locale,
  status: ReturnType<typeof useForgeStatus>,
): string {
  const t = COPY[locale];
  if (status?.engine?.chip.variant === "hybrid" || status?.engine?.chip.variant === "grok") {
    return t.thinkingHybrid;
  }
  return t.thinkingLocal;
}

export function ChatPanel({
  locale,
  activePanel,
  activeSkill,
  skillPrompt,
  chatReloadKey = 0,
  thrmlSignal,
  exploreDiscuss,
  onExploreDiscuss,
  onExploreDiscussConsumed,
  onSend,
  onResetChat,
  onOpenExplore,
  onBundleImported,
  onCompareBundles,
}: ChatPanelProps) {
  const t = COPY[locale];
  const status = useForgeStatus();
  const greeting = resolveGreeting(locale, status);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [pinningId, setPinningId] = useState<string | null>(null);
  const { model, setModel } = useForgeModel(
    status?.reasoner.model ?? "llama3.2:3b",
  );
  const { messages, setMessages, resetChat } = useForgeChat(
    locale,
    greeting,
    chatReloadKey,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSkillRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!status) return;
    const nextGreeting = resolveGreeting(locale, status);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === "welcome" ? { ...m, content: nextGreeting } : m,
      ),
    );
  }, [status, locale, setMessages]);

  useEffect(() => {
    if (!exploreDiscuss) return;
    const label =
      locale === "zh"
        ? exploreDiscuss.mission.titleZh
        : exploreDiscuss.mission.title;
    setInput(`[${label}]\n${exploreDiscuss.seed}\n\n`);
    onExploreDiscussConsumed?.();
  }, [exploreDiscuss, locale, onExploreDiscussConsumed]);

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
    emitChatSent();

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
          model,
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        error?: string;
        provider?: string;
        model?: string;
        memoryInjected?: number;
        memoryUsed?: MemoryCitation[];
        fallback?: boolean;
      };

      const reply = data.message ?? data.error ?? t.error;
      const provider =
        data.provider === "xai" || data.provider === "ollama"
          ? data.provider
          : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          memoryInjected: data.memoryInjected,
          memoryUsed: data.memoryUsed,
          engine:
            provider && data.model
              ? {
                  provider,
                  model: data.model,
                  fallback: data.fallback,
                }
              : undefined,
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

  if (activePanel === "explore") {
    return (
      <ExplorePanel
        locale={locale}
        thrml={thrmlSignal}
        model={model}
        onDiscuss={onExploreDiscuss}
        onBundleImported={onBundleImported}
        onCompareBundles={onCompareBundles}
      />
    );
  }

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

  const models =
    status?.ollama?.models ??
    status?.reasoner?.models ??
    (model ? [model] : []);

  const handlePin = async (msg: ChatMessage) => {
    if (pinnedIds.has(msg.id) || pinningId) return;
    setPinningId(msg.id);
    try {
      await pinToLedger(msg.content.replace(/\n\n— .*$/, "").trim());
      setPinnedIds((prev) => new Set(prev).add(msg.id));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "assistant",
          content: t.pinFailed,
        },
      ]);
    } finally {
      setPinningId(null);
    }
  };

  return (
    <div className="forge-glass flex h-full min-h-0 flex-1 flex-col rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--forge-gold)]" />
          <span className="text-sm font-medium text-white">{t.chat}</span>
          <RuntimeStatusChip engine={status?.engine ?? null} />
        </div>
        <div className="flex items-center gap-2">
          {models.length > 0 && (
            <label className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span className="hidden sm:inline">{t.model}</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="max-w-[9rem] truncate rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/70 outline-none focus:border-[var(--forge-gold)]/30"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#111]">
                    {m}
                  </option>
                ))}
              </select>
            </label>
          )}
          {activeSkill && (
            <span className="text-xs text-[var(--forge-gold-dim)]">
              {activeSkill}
            </span>
          )}
          {onResetChat && (
            <button
              type="button"
              onClick={() => {
                resetChat(greeting);
                onResetChat();
              }}
              className="text-[10px] text-white/30 hover:text-white/60"
            >
              {locale === "zh" ? "清除" : "clear"}
            </button>
          )}
        </div>
      </div>

      <TeamMemoryStrip locale={locale} onOpenExplore={onOpenExplore} />

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group relative max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-[var(--forge-gold)]/20 text-white"
                  : "bg-white/5 text-white/75",
              )}
            >
              {msg.content}
              {msg.role === "assistant" && msg.engine && (
                <EngineBadge
                  provider={msg.engine.provider}
                  model={msg.engine.model}
                  fallback={msg.engine.fallback}
                  locale={locale}
                />
              )}
              {msg.role === "assistant" &&
                msg.memoryUsed &&
                msg.memoryUsed.length > 0 && (
                  <MemoryCitationChips
                    citations={msg.memoryUsed}
                    locale={locale}
                  />
                )}
              {msg.role === "assistant" &&
                (!msg.memoryUsed || msg.memoryUsed.length === 0) &&
                msg.memoryInjected != null &&
                msg.memoryInjected > 0 && (
                  <span className="mt-1.5 block text-[9px] font-medium uppercase tracking-wider text-violet-300/55">
                    {t.memoriesActive(msg.memoryInjected)}
                  </span>
                )}
              {msg.role === "assistant" &&
                msg.id !== "welcome" &&
                !msg.id.startsWith("skill-") &&
                !msg.id.startsWith("sys-") && (
                  <button
                    type="button"
                    title={pinnedIds.has(msg.id) ? t.pinned : t.pin}
                    disabled={pinnedIds.has(msg.id) || pinningId === msg.id}
                    onClick={() => void handlePin(msg)}
                    className={cn(
                      "absolute -right-1 -top-1 rounded-lg border border-white/10 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100",
                      pinnedIds.has(msg.id) && "opacity-100 text-[var(--forge-gold)]",
                    )}
                  >
                    {pinningId === msg.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Bookmark className="size-3" />
                    )}
                  </button>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Loader2 className="size-4 animate-spin" />
              {resolveThinking(locale, status)}
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