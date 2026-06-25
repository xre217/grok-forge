import os from "os";
import path from "path";

export type ForgePack = "default" | "vilo";

export function getForgePack(): ForgePack {
  const pack = process.env.FORGE_PACK?.trim().toLowerCase();
  return pack === "vilo" ? "vilo" : "default";
}

export function getForgeConfig() {
  const pack = getForgePack();
  const jarvisHome =
    process.env.JARVIS_HOME?.trim() || path.join(os.homedir(), ".jarvis");

  return {
    pack,
    userName: process.env.FORGE_USER_NAME?.trim() || "you",
    persona:
      process.env.FORGE_PERSONA?.trim() ||
      (pack === "vilo"
        ? "JARVIS-class co-pilot — dry British wit, maximum truth, loyal."
        : "Helpful local studio co-pilot — concise, practical, and direct."),
    project:
      process.env.FORGE_PROJECT?.trim() ||
      (pack === "vilo" ? "VILO v1.1" : "Grok Forge"),
    ledgerEnabled: process.env.FORGE_LEDGER_ENABLED !== "0",
    thrmlRepoPath: process.env.THRML_REPO_PATH?.trim() || "",
    jarvisHome,
    githubUrl:
      process.env.FORGE_GITHUB_URL?.trim() ||
      "https://github.com/xre217/grok-forge",
  };
}