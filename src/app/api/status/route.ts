import { FORGE } from "@/lib/constants";
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
  const mode = getForgeMode();
  const local = isLocalFirst();
  const ollama = await isOllamaAvailable();
  const models = await getOllamaModels();
  const ledger = getLedgerStats();

  return NextResponse.json({
    service: FORGE.name,
    version: FORGE.version,
    mode,
    localFirst: local,
    reasoner: local
      ? {
          provider: ollama ? "ollama" : "offline",
          model: getOllamaModelId(),
          models,
        }
      : {
          provider: ollama ? "ollama-fallback" : "cloud-only",
          model: getOllamaModelId(),
        },
    grok: {
      configured: Boolean(process.env.XAI_API_KEY?.trim()),
      active: !local,
      note: local
        ? "Bypassed — Local Forge uses Ollama"
        : "Optional cloud layer",
    },
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