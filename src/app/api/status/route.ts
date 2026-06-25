import { FORGE } from "@/lib/constants";
import { buildEngineSnapshot } from "@/lib/engine-status";
import { getForgeConfig } from "@/lib/forge-config";
import { getLedgerStats } from "@/lib/ledger";
import { getForgeMode, isLocalFirst } from "@/lib/local-mode";
import {
  getOllamaModelId,
  getOllamaModels,
  isOllamaAvailable,
} from "@/lib/reasoning";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const config = getForgeConfig();
  const mode = getForgeMode();
  const local = isLocalFirst();
  const ollama = await isOllamaAvailable();
  const models = await getOllamaModels();
  const ledger = getLedgerStats();
  const grokConfigured = Boolean(process.env.XAI_API_KEY?.trim());
  const ollamaModel = getOllamaModelId();
  const engine = buildEngineSnapshot({
    mode,
    localFirst: local,
    ollamaAvailable: ollama,
    ollamaModel,
    grokConfigured,
  });

  return NextResponse.json({
    service: FORGE.name,
    version: FORGE.version,
    project: config.project,
    pack: config.pack,
    mode,
    localFirst: local,
    engine,
    reasoner: {
      provider: engine.primary.provider,
      model: engine.primary.model,
      models: local ? models : undefined,
      display: engine.primary.display,
    },
    grok: engine.grok,
    ollama: { available: ollama, models },
    ledger,
    hosting: {
      type: "self-hosted",
      command: "npm run forge:local",
      port: 3847,
    },
    ts: new Date().toISOString(),
  });
}