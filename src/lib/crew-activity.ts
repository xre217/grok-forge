import { emitCrewActivityUpdated } from "@/lib/forge-events";

export type CrewActivityKind =
  | "pin"
  | "explore"
  | "bundle-export"
  | "bundle-import"
  | "session-export"
  | "session-import";

export type CrewActivity = {
  id: string;
  ts: string;
  kind: CrewActivityKind;
  summary: string;
  detail?: string;
};

const STORAGE_KEY = "forge-crew-activity";
const MAX_ENTRIES = 64;

function truncate(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function logCrewActivity(
  kind: CrewActivityKind,
  summary: string,
  detail?: string,
): CrewActivity {
  const entry: CrewActivity = {
    id: `crew-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
    kind,
    summary: truncate(summary, 160),
    detail: detail ? truncate(detail, 240) : undefined,
  };

  if (typeof window === "undefined") return entry;

  try {
    const existing = getCrewActivities(MAX_ENTRIES);
    const next = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitCrewActivityUpdated();
  } catch {
    // ignore quota / private mode
  }

  return entry;
}

export function getCrewActivities(limit = 20): CrewActivity[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CrewActivity[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
}

export function clearCrewActivities(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  emitCrewActivityUpdated();
}