import type { ForgeMode } from "@/lib/local-mode";

export type EngineProvider = "ollama" | "xai" | "offline";

export type EngineChipVariant =
  | "local"
  | "hybrid"
  | "grok"
  | "offline"
  | "warn";

export type EngineSnapshot = {
  mode: ForgeMode;
  localFirst: boolean;
  chip: {
    short: string;
    label: string;
    variant: EngineChipVariant;
    title: string;
  };
  primary: {
    provider: EngineProvider;
    model: string;
    display: string;
  };
  grok: { configured: boolean; active: boolean; note: string };
  ollama: { available: boolean };
};

type BuildEngineArgs = {
  mode: ForgeMode;
  localFirst: boolean;
  ollamaAvailable: boolean;
  ollamaModel: string;
  grokConfigured: boolean;
};

export function formatEngineDisplay(
  provider: EngineProvider,
  model: string,
): string {
  if (provider === "xai") return `Grok · ${model}`;
  if (provider === "ollama") return `Ollama · ${model}`;
  return "Offline";
}

export function buildEngineSnapshot(args: BuildEngineArgs): EngineSnapshot {
  const {
    mode,
    localFirst,
    ollamaAvailable,
    ollamaModel,
    grokConfigured,
  } = args;

  if (localFirst) {
    const offline = !ollamaAvailable;
    return {
      mode,
      localFirst: true,
      chip: {
        short: offline ? "OFFLINE" : "LOCAL",
        label: offline
          ? "Local mode · Ollama offline"
          : "Local mode · Ollama on your machine",
        variant: offline ? "offline" : "local",
        title: offline
          ? "Start Ollama: ollama serve"
          : "Grok/xAI is not used in local-first mode",
      },
      primary: {
        provider: offline ? "offline" : "ollama",
        model: ollamaModel,
        display: offline
          ? "Ollama offline"
          : formatEngineDisplay("ollama", ollamaModel),
      },
      grok: {
        configured: grokConfigured,
        active: false,
        note: "Bypassed — local-first uses Ollama only",
      },
      ollama: { available: ollamaAvailable },
    };
  }

  if (mode === "cloud") {
    return {
      mode,
      localFirst: false,
      chip: {
        short: grokConfigured ? "GROK" : "NO KEY",
        label: grokConfigured
          ? "Cloud mode · Grok API"
          : "Cloud mode · XAI_API_KEY missing",
        variant: grokConfigured ? "grok" : "warn",
        title: grokConfigured
          ? "Replies use xAI Grok models"
          : "Set XAI_API_KEY or switch to FORGE_MODE=local",
      },
      primary: {
        provider: grokConfigured ? "xai" : "offline",
        model: grokConfigured ? "grok" : "—",
        display: grokConfigured ? "Grok · API" : "Grok not configured",
      },
      grok: {
        configured: grokConfigured,
        active: grokConfigured,
        note: "Cloud-only — Ollama used only if Grok fails",
      },
      ollama: { available: ollamaAvailable },
    };
  }

  // hybrid
  return {
    mode,
    localFirst: false,
    chip: {
      short: grokConfigured ? "HYBRID" : "LOCAL*",
      label: grokConfigured
        ? "Hybrid · Grok first, Ollama fallback"
        : "Hybrid · no API key (Ollama only)",
      variant: grokConfigured ? "hybrid" : "warn",
      title: grokConfigured
        ? "Tries Grok, falls back to Ollama if credits fail"
        : "Add XAI_API_KEY for Grok, or use FORGE_MODE=local",
    },
    primary: {
      provider: grokConfigured ? "xai" : ollamaAvailable ? "ollama" : "offline",
      model: grokConfigured ? "grok" : ollamaModel,
      display: grokConfigured
        ? "Grok · primary"
        : ollamaAvailable
          ? formatEngineDisplay("ollama", ollamaModel)
          : "No engine available",
    },
    grok: {
      configured: grokConfigured,
      active: grokConfigured,
      note: grokConfigured
        ? "Optional cloud layer — Ollama is fallback"
        : "Grok not configured",
    },
    ollama: { available: ollamaAvailable },
  };
}

export const CHIP_STYLES: Record<
  EngineChipVariant,
  string
> = {
  local: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  hybrid: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  grok: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  offline: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  warn: "bg-orange-500/15 text-orange-300 border-orange-500/20",
};

export const PROVIDER_STYLES: Record<
  Exclude<EngineProvider, "offline">,
  string
> = {
  ollama: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300/90",
  xai: "border-sky-500/25 bg-sky-500/10 text-sky-200/90",
};