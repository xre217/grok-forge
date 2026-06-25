import { buildForgeSystem, renderChatHistory } from "@/lib/forge-system";
import { getForgeConfig } from "@/lib/forge-config";
import {
  getTeamMemoryCitations,
  getTeamMemoryLimit,
} from "@/lib/team-memory";
import { formatReasoningError, generateWithFallback } from "@/lib/reasoning";
import type { Locale } from "@/types/forge";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatBody = {
  messages?: ChatMessage[];
  locale?: Locale;
  skillPrompt?: string;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatBody;
    const messages = body.messages ?? [];
    const locale = body.locale ?? "en";
    const latest = messages.at(-1)?.content ?? "";

    if (!latest.trim()) {
      return NextResponse.json({ error: "Empty message." }, { status: 400 });
    }

    const system = buildForgeSystem({
      locale,
      skillPrompt: body.skillPrompt,
    });

    const prompt = [
      "CHAT HISTORY",
      renderChatHistory(messages),
      "",
      "Respond to the latest USER message.",
    ].join("\n");

    const config = getForgeConfig();
    const memoryLimit = getTeamMemoryLimit(config.pack);
    const memoryUsed = config.ledgerEnabled
      ? getTeamMemoryCitations(memoryLimit)
      : [];

    const result = await generateWithFallback({
      system,
      prompt,
      model: body.model,
    });

    return NextResponse.json({
      message: result.text,
      model: result.model,
      provider: result.provider,
      fallback: result.fallback ?? false,
      grokConfigured: Boolean(process.env.XAI_API_KEY?.trim()),
      memoryInjected: memoryUsed.length,
      memoryUsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: formatReasoningError(error),
        grokConfigured: Boolean(process.env.XAI_API_KEY?.trim()),
      },
      { status: 502 },
    );
  }
}