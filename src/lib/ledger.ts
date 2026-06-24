import fs from "fs";
import os from "os";
import path from "path";

export type LedgerEntry = {
  id: string;
  ts: string;
  type: string;
  claim: string;
  evidence?: string;
  confidence?: number;
  tags?: string[];
  source?: string;
};

const JARVIS_HOME =
  process.env.JARVIS_HOME?.trim() || path.join(os.homedir(), ".jarvis");
const LEDGER_FILE = path.join(JARVIS_HOME, "memory", "ledger.jsonl");

export function getLedgerPath() {
  return LEDGER_FILE;
}

export function getRecentLedgerEntries(limit = 12): LedgerEntry[] {
  if (!fs.existsSync(LEDGER_FILE)) return [];

  const raw = fs.readFileSync(LEDGER_FILE, "utf8").trim();
  if (!raw) return [];

  const entries: LedgerEntry[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line) as LedgerEntry);
    } catch {
      // skip malformed lines
    }
  }

  return entries.slice(-limit);
}

export function formatLedgerContext(limit = 8): string {
  const entries = getRecentLedgerEntries(limit);
  if (!entries.length) {
    return "No ledger entries found. Constitution path: " + LEDGER_FILE;
  }

  return entries
    .map((e) => {
      const tags = e.tags?.length ? ` [${e.tags.join(",")}]` : "";
      const conf =
        e.confidence != null ? ` (c=${e.confidence.toFixed(2)})` : "";
      return `[${e.ts}] (${e.type}${conf}${tags}) ${e.claim}`;
    })
    .join("\n");
}

export function getLedgerStats() {
  const entries = getRecentLedgerEntries(10_000);
  const sovereignty = entries.filter((e) =>
    e.tags?.some((t) =>
      ["sovereignty", "vilo", "nationalization"].includes(t),
    ),
  );
  return {
    path: LEDGER_FILE,
    total: entries.length,
    sovereigntyTagged: sovereignty.length,
    newest: entries.at(-1)?.ts ?? null,
  };
}