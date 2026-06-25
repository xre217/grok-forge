import { getForgeConfig } from "@/lib/forge-config";
import { formatTeamMemoryContext } from "@/lib/team-memory";
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

  const memoryBlock = config.ledgerEnabled
    ? [
        "",
        "TEAM MEMORY (constitution for this session — prioritize in every reply):",
        formatTeamMemoryContext(config.pack === "vilo" ? 12 : 10),
        "Honor these observations. Extend them; do not contradict without new evidence.",
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
      ? "You are an untrusted reasoner. The team's append-only Evidence Ledger owns long-term truth, not you."
      : "You are an untrusted reasoner. The team's ledger and exported sessions own long-term truth, not you.",
    localeLine,
    skillBlock,
    memoryBlock,
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