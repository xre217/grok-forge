import { getForgeConfig } from "@/lib/forge-config";
import { formatLedgerContext } from "@/lib/ledger";
import { isLocalFirst } from "@/lib/local-mode";
import type { Locale } from "@/types/forge";

type BuildSystemArgs = {
  locale: Locale;
  skillPrompt?: string;
};

export function buildForgeSystem({ locale, skillPrompt }: BuildSystemArgs) {
  const config = getForgeConfig();
  const localeLine =
    locale === "zh"
      ? "Respond in Simplified Chinese unless the user writes in English."
      : "Respond in English unless the user writes in Chinese.";

  const skillBlock = skillPrompt
    ? `\nACTIVE SKILL MODE:\n${skillPrompt}\n`
    : "";

  const modeLine = isLocalFirst()
    ? "RUNTIME: Local Forge — Ollama on-device. No cloud credits required."
    : "RUNTIME: Hybrid — remote Grok when available, Ollama fallback.";

  const ledgerBlock =
    config.ledgerEnabled && config.pack === "vilo"
      ? [
          "",
          "SOVEREIGN LEDGER CONTEXT (primary truth — injected from local ledger):",
          formatLedgerContext(8),
        ].join("\n")
      : config.ledgerEnabled
        ? [
            "",
            "LOCAL LEDGER CONTEXT (recent entries, if available):",
            formatLedgerContext(6),
          ].join("\n")
        : "";

  const identityLine =
    config.pack === "vilo"
      ? `You are the Local Forge co-pilot for ${config.userName} (${config.project}).`
      : `You are the Grok Forge co-pilot helping ${config.userName} build with their local AI studio.`;

  return [
    identityLine,
    config.persona,
    modeLine,
    "You help users chat, plan, and ship with a beautiful local studio — skills, session export, optional memory.",
    config.pack === "vilo"
      ? "You are an untrusted reasoner. The user's append-only Evidence Ledger owns long-term truth, not you."
      : "You are an untrusted reasoner. The user's exported sessions and optional ledger own long-term truth, not you.",
    localeLine,
    skillBlock,
    ledgerBlock,
    "Be concise and actionable. Suggest concrete next steps.",
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