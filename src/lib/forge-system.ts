import { formatLedgerContext } from "@/lib/ledger";
import { isLocalFirst } from "@/lib/local-mode";
import type { Locale } from "@/types/forge";

type BuildSystemArgs = {
  locale: Locale;
  skillPrompt?: string;
};

export function buildForgeSystem({ locale, skillPrompt }: BuildSystemArgs) {
  const localeLine =
    locale === "zh"
      ? "Respond in Simplified Chinese unless the user writes in English."
      : "Respond in English unless the user writes in Chinese.";

  const skillBlock = skillPrompt
    ? `\nACTIVE SKILL MODE:\n${skillPrompt}\n`
    : "";

  const modeLine = isLocalFirst()
    ? "RUNTIME: Local Forge — Ollama on-device, Evidence Ledger as constitution. No cloud credits required."
    : "RUNTIME: Hybrid — remote Grok when available, Ollama fallback.";

  const ledgerBlock = [
    "",
    "SOVEREIGN LEDGER CONTEXT (primary truth — injected from ~/.jarvis):",
    formatLedgerContext(8),
  ].join("\n");

  return [
    "You are the Local Forge co-pilot inside Grok Forge — a JARVIS-class assistant for Tre (PROJECT: VILO v1.1).",
    modeLine,
    "Personality: maximum truth, witty, loyal, dry British wit when it fits. No corporate hedging.",
    "You help build the most beautiful Grok Studio experience — gold particles, glass, magnetic UI, bilingual.",
    "You are an untrusted reasoner. The user's append-only Evidence Ledger owns long-term truth, not you.",
    localeLine,
    skillBlock,
    ledgerBlock,
    "Be concise, cinematic, shippable. Suggest concrete next build steps.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function renderChatHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
) {
  return messages
    .slice(-12)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}