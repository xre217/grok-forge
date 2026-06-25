import type { LedgerEntry } from "@/lib/ledger";
import { getLedgerPath } from "@/lib/ledger";
import fs from "fs";

const STREAM_TAGS = new Set([
  "exploration",
  "consciousness",
  "cosmos",
  "universe",
  "collective",
  "starship",
  "team",
  "pinned",
]);

function readAllEntries(): LedgerEntry[] {
  const file = getLedgerPath();
  if (!fs.existsSync(file)) return [];

  const raw = fs.readFileSync(file, "utf8").trim();
  if (!raw) return [];

  const entries: LedgerEntry[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      entries.push(JSON.parse(line) as LedgerEntry);
    } catch {
      // skip malformed
    }
  }
  return entries;
}

function memoryScore(entry: LedgerEntry, index: number, total: number): number {
  let score = index / Math.max(total, 1);
  if (entry.type === "exploration") score += 3;
  if (entry.tags?.includes("pinned")) score += 2.5;
  if (entry.tags?.some((t) => STREAM_TAGS.has(t))) score += 1.5;
  if (entry.source?.includes("forge")) score += 0.5;
  return score;
}

export function getTeamMemoryEntries(limit = 10): LedgerEntry[] {
  const all = readAllEntries();
  if (!all.length) return [];

  const total = all.length;
  return [...all]
    .map((entry, index) => ({ entry, score: memoryScore(entry, index, total) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function getConsciousnessStreamEntries(limit = 16): LedgerEntry[] {
  const all = readAllEntries();
  return all
    .filter(
      (e) =>
        e.type === "exploration" ||
        e.tags?.some((t) => STREAM_TAGS.has(t)),
    )
    .slice(-limit);
}

function formatEntry(entry: LedgerEntry): string {
  const tags = entry.tags?.length ? ` [${entry.tags.join(",")}]` : "";
  const conf =
    entry.confidence != null ? ` (c=${entry.confidence.toFixed(2)})` : "";
  return `[${entry.ts.slice(0, 19)}] (${entry.type}${conf}${tags}) ${entry.claim}`;
}

export function formatTeamMemoryContext(limit = 10): string {
  const entries = getTeamMemoryEntries(limit);
  if (!entries.length) {
    return `No team memory yet (${getLedgerPath()}). Pin chat replies or log Explore missions.`;
  }

  const explorations = entries.filter((e) => e.type === "exploration");
  const pinned = entries.filter((e) => e.tags?.includes("pinned"));
  const other = entries.filter(
    (e) => e.type !== "exploration" && !e.tags?.includes("pinned"),
  );

  const sections: string[] = [];

  if (explorations.length) {
    sections.push(
      "EXPLORATIONS:",
      ...explorations.map(formatEntry),
    );
  }
  if (pinned.length) {
    sections.push(
      "",
      "PINNED:",
      ...pinned.map(formatEntry),
    );
  }
  if (other.length) {
    sections.push(
      "",
      "RECENT:",
      ...other.map(formatEntry),
    );
  }

  return sections.join("\n");
}