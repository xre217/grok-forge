import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider-v2";
import { isLocalFirst } from "@/lib/local-mode";

export type ReasoningResult = {
  text: string;
  provider: "xai" | "ollama";
  model: string;
  fallback?: boolean;
};

type GenerateArgs = {
  system: string;
  prompt: string;
  model?: string;
};

function resolveOllamaModel(requested?: string) {
  return requested?.trim() || getOllamaModelId();
}

function modelMatches(available: string, wanted: string) {
  return (
    available === wanted ||
    available.startsWith(`${wanted}:`) ||
    wanted.startsWith(`${available}:`)
  );
}

const XAI_MODELS = [
  process.env.XAI_MODEL?.trim(),
  "grok-4.3",
  "grok-4",
  "grok-3-mini",
].filter(Boolean) as string[];

function getOllamaClient() {
  const baseURL =
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434/api";
  return createOllama({ baseURL });
}

export function getOllamaModelId() {
  return process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b";
}

function getOllamaBase() {
  return (
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434/api"
  ).replace(/\/api\/?$/, "");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown reasoning error.";
}

export function formatReasoningError(error: unknown) {
  const msg = errorMessage(error).toLowerCase();
  if (msg.includes("credits") || msg.includes("licenses")) {
    return "xAI credits exhausted — Local Forge uses Ollama. Set FORGE_MODE=local in .env.local.";
  }
  if (msg.includes("incorrect api key") || msg.includes("401")) {
    return "Invalid XAI_API_KEY. Local mode ignores this — use FORGE_MODE=local.";
  }
  if (msg.includes("ollama") || msg.includes("fetch failed")) {
    return "Ollama offline. Run: ollama serve";
  }
  return errorMessage(error);
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${getOllamaBase()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      models?: Array<{ name: string }>;
    };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

export async function isOllamaAvailable(requestedModel?: string) {
  const models = await getOllamaModels();
  if (!models.length) return false;
  const wanted = resolveOllamaModel(requestedModel);
  return models.some((name) => modelMatches(name, wanted));
}

async function generateWithOllama({
  system,
  prompt,
  model: requestedModel,
}: GenerateArgs): Promise<ReasoningResult> {
  const model = resolveOllamaModel(requestedModel);
  const result = await generateText({
    model: getOllamaClient()(model),
    system,
    prompt,
    providerOptions: {
      ollama: {
        options: {
          num_predict: 2048,
          temperature: 0.65,
        },
      },
    },
  });
  return { text: result.text, provider: "ollama", model };
}

async function generateWithXai({
  system,
  prompt,
}: GenerateArgs): Promise<ReasoningResult> {
  const failures: string[] = [];
  for (const model of [...new Set(XAI_MODELS)]) {
    try {
      const result = await generateText({
        model: xai(model),
        system,
        prompt,
      });
      return { text: result.text, provider: "xai", model };
    } catch (error) {
      failures.push(`${model}: ${errorMessage(error)}`);
    }
  }
  throw new Error(failures.join(" | "));
}

export async function generateWithFallback({
  system,
  prompt,
  model,
}: GenerateArgs): Promise<ReasoningResult> {
  const wanted = resolveOllamaModel(model);

  if (isLocalFirst()) {
    if (await isOllamaAvailable(wanted)) {
      return generateWithOllama({ system, prompt, model: wanted });
    }
    throw new Error(
      `Local Forge needs Ollama with ${wanted}. Run: ollama pull ${wanted}`,
    );
  }

  const hasKey = Boolean(process.env.XAI_API_KEY?.trim());

  if (hasKey) {
    try {
      return await generateWithXai({ system, prompt });
    } catch (xaiError) {
      if (await isOllamaAvailable(wanted)) {
        const result = await generateWithOllama({ system, prompt, model: wanted });
        return { ...result, fallback: true };
      }
      throw new Error(formatReasoningError(xaiError));
    }
  }

  if (await isOllamaAvailable(wanted)) {
    return generateWithOllama({ system, prompt, model: wanted });
  }

  throw new Error(
    `No cloud credits and Ollama offline. Set FORGE_MODE=local and run: ollama serve`,
  );
}