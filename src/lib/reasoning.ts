import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";
import { createOllama } from "ollama-ai-provider-v2";

export type ReasoningResult = {
  text: string;
  provider: "xai" | "ollama";
  model: string;
  fallback?: boolean;
};

type GenerateArgs = {
  system: string;
  prompt: string;
};

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

function getOllamaModelId() {
  return process.env.OLLAMA_MODEL?.trim() || "llama3.2:3b";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown reasoning error.";
}

export function formatReasoningError(error: unknown) {
  const msg = errorMessage(error).toLowerCase();
  if (msg.includes("credits") || msg.includes("licenses")) {
    return "xAI credits exhausted on this key. Add credits at console.x.ai or start Ollama locally for fallback.";
  }
  if (msg.includes("incorrect api key") || msg.includes("401")) {
    return "Invalid XAI_API_KEY. Update .env.local with a valid key.";
  }
  return errorMessage(error);
}

export async function isOllamaAvailable() {
  const base = (
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434/api"
  ).replace(/\/api\/?$/, "");
  try {
    const response = await fetch(`${base}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function generateWithOllama({
  system,
  prompt,
}: GenerateArgs): Promise<ReasoningResult> {
  const model = getOllamaModelId();
  const result = await generateText({
    model: getOllamaClient()(model),
    system,
    prompt,
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
}: GenerateArgs): Promise<ReasoningResult> {
  const hasKey = Boolean(process.env.XAI_API_KEY?.trim());

  if (hasKey) {
    try {
      return await generateWithXai({ system, prompt });
    } catch {
      if (await isOllamaAvailable()) {
        const result = await generateWithOllama({ system, prompt });
        return { ...result, fallback: true };
      }
      throw new Error("xAI failed and Ollama is unavailable.");
    }
  }

  if (await isOllamaAvailable()) {
    return generateWithOllama({ system, prompt });
  }

  throw new Error(
    "No XAI_API_KEY and Ollama is not reachable. Run: ollama serve && ollama pull llama3.2:3b",
  );
}