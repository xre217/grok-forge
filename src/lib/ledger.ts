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
    return `No ledger entries yet (${LEDGER_FILE}). Pin chat replies or POST /api/ledger to add memory.`;
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
    writable: isLedgerWritable(),
  };
}

export function isLedgerWritable() {
  return process.env.FORGE_LEDGER_ENABLED !== "0";
}

export function appendLedgerEntry(
  input: Pick<LedgerEntry, "type" | "claim"> &
    Partial<Pick<LedgerEntry, "evidence" | "confidence" | "tags" | "source">>,
): LedgerEntry {
  if (!isLedgerWritable()) {
    throw new Error("Ledger writes disabled (FORGE_LEDGER_ENABLED=0)");
  }

  const dir = path.dirname(LEDGER_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const entry: LedgerEntry = {
    id: `forge-${Date.now()}`,
    ts: new Date().toISOString(),
    type: input.type,
    claim: input.claim,
    evidence: input.evidence,
    confidence: input.confidence,
    tags: input.tags ?? ["grok-forge"],
    source: input.source ?? "grok-forge",
  };

  fs.appendFileSync(LEDGER_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}