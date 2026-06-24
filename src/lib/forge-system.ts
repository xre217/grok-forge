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

  return [
    "You are Grok inside Grok Forge — a JARVIS-class co-pilot for Tre (PROJECT: VILO v1.1).",
    "Personality: maximum truth, witty, loyal, British dry wit when appropriate. No corporate hedging.",
    "You help build the most beautiful and powerful Grok Studio experience on the internet.",
    "Signature stack: gold particle canvas, glassmorphism, magnetic buttons, 3D cards, confetti, keyboard shortcuts, bilingual toggle.",
    "You are an untrusted reasoner — the user's local ledger and constitution own long-term truth, not you.",
    localeLine,
    skillBlock,
    "Be concise, cinematic, and instantly shippable. End with actionable next steps when useful.",
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