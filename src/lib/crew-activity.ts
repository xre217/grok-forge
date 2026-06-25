import { emitCrewActivityUpdated } from "@/lib/forge-events";
import type { CrewActivity, CrewActivityKind } from "@/types/forge";

export type { CrewActivity, CrewActivityKind };

const STORAGE_KEY = "forge-crew-activity";
export const CREW_ACTIVITY_MAX = 64;
const EXPORT_SLICE = 32;

function truncate(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function isCrewActivity(value: unknown): value is CrewActivity {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as CrewActivity;
  return (
    typeof entry.id === "string" &&
    typeof entry.ts === "string" &&
    typeof entry.kind === "string" &&
    typeof entry.summary === "string"
  );
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
    const existing = getCrewActivities(CREW_ACTIVITY_MAX);
    const next = [entry, ...existing].slice(0, CREW_ACTIVITY_MAX);
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
    return parsed.filter(isCrewActivity).slice(0, limit);
  } catch {
    return [];
  }
}

export function getCrewActivitiesForExport(limit = EXPORT_SLICE): CrewActivity[] {
  return getCrewActivities(limit);
}

export function mergeCrewActivities(incoming: CrewActivity[]): number {
  if (typeof window === "undefined" || !incoming.length) return 0;

  const valid = incoming.filter(isCrewActivity);
  if (!valid.length) return 0;

  const existing = getCrewActivities(CREW_ACTIVITY_MAX);
  const seen = new Set(existing.map((e) => e.id));
  const merged: CrewActivity[] = [];

  for (const entry of valid) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    merged.push(entry);
  }

  if (!merged.length) return 0;

  const next = [...merged, ...existing].slice(0, CREW_ACTIVITY_MAX);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitCrewActivityUpdated();
  return merged.length;
}

export function clearCrewActivities(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  emitCrewActivityUpdated();
}