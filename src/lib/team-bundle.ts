import { FORGE } from "@/lib/constants";
import { EXPLORATION_MISSIONS, getMission } from "@/lib/explorations";
import type { LedgerEntry } from "@/lib/ledger";
import type {
  Locale,
  TeamBundle,
  TeamBundleEntry,
  TeamBundleMissionSlice,
} from "@/types/forge";

export const TEAM_BUNDLE_TAGS = new Set([
  "exploration",
  "consciousness",
  "cosmos",
  "universe",
  "collective",
  "starship",
  "team",
  "pinned",
]);

export function isTeamBundleEntry(entry: {
  type?: string;
  tags?: string[];
}): boolean {
  if (entry.type === "exploration") return true;
  return Boolean(entry.tags?.some((t) => TEAM_BUNDLE_TAGS.has(t)));
}

export function toTeamBundleEntry(entry: LedgerEntry | Record<string, unknown>): TeamBundleEntry {
  const e = entry as TeamBundleEntry;
  return {
    id: e.id,
    ts: e.ts,
    type: e.type,
    claim: e.claim,
    evidence: e.evidence,
    confidence: e.confidence,
    tags: e.tags ?? [],
    source: e.source,
  };
}

function missionIdFromTags(tags?: string[]): string | null {
  const tag = tags?.find((t) => t.startsWith("mission:"));
  return tag ? tag.slice("mission:".length) : null;
}

export function groupEntriesByMission(
  entries: TeamBundleEntry[],
): TeamBundleMissionSlice[] {
  const buckets = new Map<string, TeamBundleEntry[]>();

  for (const entry of entries) {
    const missionId = missionIdFromTags(entry.tags) ?? "open-exploration";
    const list = buckets.get(missionId) ?? [];
    list.push(entry);
    buckets.set(missionId, list);
  }

  return [...buckets.entries()].map(([missionId, slice]) => {
    const mission = getMission(missionId);
    return {
      missionId,
      title: mission?.title ?? "Open exploration",
      titleZh: mission?.titleZh ?? "开放探索",
      domain: mission?.domain ?? "collective",
      entryCount: slice.length,
      entries: slice,
    };
  });
}

function buildBundleSummary(bundle: Omit<TeamBundle, "summary">): string {
  const lines = [
    `# ${FORGE.name} Team Bundle`,
    ``,
    `Exported: ${bundle.exportedAt}`,
    `Team: ${bundle.team.label}`,
    `Entries: ${bundle.stats.total} (${bundle.stats.explorations} explorations, ${bundle.stats.pinned} pinned)`,
    `Missions: ${bundle.missions.length}`,
    ``,
    `## Missions`,
    ...bundle.missions.map(
      (m) =>
        `### ${m.title} (${m.entryCount})\n${m.entries
          .map((e) => `- ${e.claim}`)
          .join("\n")}`,
    ),
  ];
  return lines.join("\n");
}

export async function buildTeamBundle(
  locale: Locale,
  teamLabel?: string,
): Promise<TeamBundle> {
  const [res, configRes] = await Promise.all([
    fetch("/api/ledger?limit=100"),
    fetch("/api/config"),
  ]);
  const data = res.ok
    ? ((await res.json()) as { entries: Array<Record<string, unknown>> })
    : { entries: [] };

  const config = configRes.ok
    ? ((await configRes.json()) as { teamName?: string; project?: string })
    : null;
  const teamLabelResolved =
    teamLabel?.trim() ||
    config?.teamName ||
    config?.project ||
    FORGE.project;

  const memory = data.entries
    .filter(isTeamBundleEntry)
    .map(toTeamBundleEntry);

  const missions = groupEntriesByMission(memory);
  const explorations = memory.filter((e) => e.type === "exploration").length;
  const pinned = memory.filter((e) => e.tags?.includes("pinned")).length;

  const base = {
    format: "grok-forge-team-bundle" as const,
    version: "1.0" as const,
    exportedAt: new Date().toISOString(),
    forge: {
      name: FORGE.name,
      version: FORGE.version,
      tagline: FORGE.tagline,
    },
    team: {
      label: teamLabelResolved,
      locale,
    },
    memory: { entries: memory },
    missions,
    stats: {
      explorations,
      pinned,
      total: memory.length,
    },
  };

  return { ...base, summary: buildBundleSummary(base) };
}

export function downloadTeamBundle(bundle: TeamBundle): string {
  const stamp = bundle.exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  const filename = `grok-forge-team-bundle-${stamp}.json`;
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return filename;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTeamBundleEntryShape(value: unknown): value is TeamBundleEntry {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.ts === "string" &&
    typeof value.type === "string" &&
    typeof value.claim === "string"
  );
}

export function validateTeamBundle(data: unknown): TeamBundle | null {
  if (!isRecord(data)) return null;
  if (data.format !== "grok-forge-team-bundle") return null;
  if (data.version !== "1.0") return null;
  if (typeof data.exportedAt !== "string") return null;
  if (!isRecord(data.memory) || !Array.isArray(data.memory.entries)) return null;
  if (!data.memory.entries.every(isTeamBundleEntryShape)) return null;
  return data as TeamBundle;
}

export async function readTeamBundleFile(file: File): Promise<TeamBundle> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const bundle = validateTeamBundle(parsed);
  if (!bundle) {
    throw new Error(
      "Unrecognized team bundle. Expected grok-forge-team-bundle v1.0.",
    );
  }
  return bundle;
}

export type BundleEntryImportStatus = "new" | "duplicate" | "invalid";

export type BundleImportPreviewEntry = TeamBundleEntry & {
  status: BundleEntryImportStatus;
};

export type BundleImportPreviewMission = {
  missionId: string;
  title: string;
  titleZh: string;
  domain: string;
  entries: BundleImportPreviewEntry[];
  newCount: number;
  duplicateCount: number;
};

export type BundleImportPreview = {
  team: string;
  exportedAt: string;
  forgeVersion: string;
  missions: BundleImportPreviewMission[];
  stats: {
    total: number;
    new: number;
    duplicate: number;
    invalid: number;
    explorations: number;
    pinned: number;
  };
};

function isImportableBundleEntry(entry: TeamBundleEntry): boolean {
  return Boolean(entry.id?.trim() && entry.claim?.trim() && entry.type?.trim());
}

export function buildBundleImportPreview(
  bundle: TeamBundle,
  existingIds: Iterable<string>,
): BundleImportPreview {
  const existing = new Set(existingIds);

  const annotate = (entry: TeamBundleEntry): BundleImportPreviewEntry => {
    if (!isImportableBundleEntry(entry)) {
      return { ...entry, status: "invalid" };
    }
    if (existing.has(entry.id)) {
      return { ...entry, status: "duplicate" };
    }
    return { ...entry, status: "new" };
  };

  const annotated = bundle.memory.entries.map(annotate);
  const missions = groupEntriesByMission(bundle.memory.entries).map((mission) => {
    const entries = mission.entries.map(annotate);
    return {
      missionId: mission.missionId,
      title: mission.title,
      titleZh: mission.titleZh,
      domain: mission.domain,
      entries,
      newCount: entries.filter((e) => e.status === "new").length,
      duplicateCount: entries.filter((e) => e.status === "duplicate").length,
    };
  });

  const newCount = annotated.filter((e) => e.status === "new").length;
  const duplicateCount = annotated.filter((e) => e.status === "duplicate").length;
  const invalidCount = annotated.filter((e) => e.status === "invalid").length;

  return {
    team: bundle.team.label,
    exportedAt: bundle.exportedAt,
    forgeVersion: bundle.forge.version,
    missions,
    stats: {
      total: bundle.stats.total,
      new: newCount,
      duplicate: duplicateCount,
      invalid: invalidCount,
      explorations: bundle.stats.explorations,
      pinned: bundle.stats.pinned,
    },
  };
}

export async function fetchLedgerEntryIds(limit = 500): Promise<Set<string>> {
  const res = await fetch(`/api/ledger?limit=${limit}`);
  if (!res.ok) return new Set();

  const data = (await res.json()) as {
    entries?: Array<{ id?: string }>;
  };

  const ids = new Set<string>();
  for (const entry of data.entries ?? []) {
    if (entry.id) ids.add(entry.id);
  }
  return ids;
}

/** Mission ids referenced in bundle — useful for import UI hints */
export function listBundleMissionIds(bundle: TeamBundle): string[] {
  return [
    ...new Set(
      bundle.memory.entries
        .map((e) => missionIdFromTags(e.tags))
        .filter((id): id is string => Boolean(id)),
    ),
  ].filter((id) => EXPLORATION_MISSIONS.some((m) => m.id === id));
}