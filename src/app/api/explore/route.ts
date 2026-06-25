import { getMission } from "@/lib/explorations";
import { appendLedgerEntry, isLedgerWritable } from "@/lib/ledger";
import { generateWithFallback } from "@/lib/reasoning";
import type { Locale } from "@/types/forge";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ExploreBody = {
  reflection?: string;
  missionId?: string;
  locale?: Locale;
  model?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExploreBody;
    const reflection = body.reflection?.trim() ?? "";
    const missionId = body.missionId?.trim() ?? "";
    const locale = body.locale ?? "en";

    if (!reflection) {
      return NextResponse.json({ error: "Reflection is required." }, { status: 400 });
    }

    const mission = missionId ? getMission(missionId) : undefined;
    const missionLine = mission
      ? `MISSION (${mission.title}): ${mission.question}`
      : "MISSION: Open exploration";

    const system = [
      "You are the Grok Forge exploration co-pilot.",
      "Distill the user's reflection into one clear, wonder-preserving observation for a shared consciousness stream.",
      "Maximum 3 sentences. No hedging. Suitable for an append-only team ledger.",
      locale === "zh"
        ? "Respond in Simplified Chinese."
        : "Respond in English.",
    ].join("\n");

    const prompt = [
      missionLine,
      mission?.prompt ?? "",
      "",
      "USER REFLECTION:",
      reflection,
      "",
      "Output only the distilled observation — no preamble.",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await generateWithFallback({
      system,
      prompt,
      model: body.model,
    });

    let entry = null;
    if (isLedgerWritable()) {
      entry = appendLedgerEntry({
        type: "exploration",
        claim: result.text.trim(),
        evidence: reflection.slice(0, 800),
        confidence: 0.72,
        tags: mission
          ? [`mission:${mission.id}`, ...mission.tags]
          : ["exploration", "consciousness", "cosmos"],
        source: "grok-forge-explore",
      });
    }

    return NextResponse.json({
      observation: result.text.trim(),
      entry,
      provider: result.provider,
      model: result.model,
      mission: mission?.id ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Explore failed",
      },
      { status: 502 },
    );
  }
}