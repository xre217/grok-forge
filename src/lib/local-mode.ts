export type ForgeMode = "local" | "hybrid" | "cloud";

export function getForgeMode(): ForgeMode {
  const mode = process.env.FORGE_MODE?.trim().toLowerCase();
  if (mode === "local" || mode === "offline") return "local";
  if (mode === "cloud") return "cloud";
  return "hybrid";
}

/** Local-first: Ollama + ledger only. No xAI credits or Vercel required. */
export function isLocalFirst(): boolean {
  return getForgeMode() === "local" || process.env.FORGE_LOCAL_FIRST === "1";
}