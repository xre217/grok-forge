import { getCrewActivitiesForExport } from "@/lib/crew-activity";
import { FORGE } from "@/lib/constants";
import { EXPLORATION_MISSIONS, getMission } from "@/lib/explorations";
import type { LedgerEntry } from "@/lib/ledger";
import type {
  CrewActivity,
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
    `Crew log: ${bundle.crewLog?.entries.length ?? 0} events`,
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

  const crewEntries = getCrewActivitiesForExport(24);

  const base = {
    format: "grok-forge-team-bundle" as const,
    version: "1.1" as const,
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
      crewLog: crewEntries.length,
    },
    crewLog: crewEntries.length ? { entries: crewEntries } : undefined,
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

function isCrewActivityShape(value: unknown): value is CrewActivity {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.ts === "string" &&
    typeof value.kind === "string" &&
    typeof value.summary === "string"
  );
}

export function validateTeamBundle(data: unknown): TeamBundle | null {
  if (!isRecord(data)) return null;
  if (data.format !== "grok-forge-team-bundle") return null;
  if (data.version !== "1.0" && data.version !== "1.1") return null;
  if (typeof data.exportedAt !== "string") return null;
  if (!isRecord(data.memory) || !Array.isArray(data.memory.entries)) return null;
  if (!data.memory.entries.every(isTeamBundleEntryShape)) return null;
  if (isRecord(data.crewLog)) {
    if (!Array.isArray(data.crewLog.entries)) return null;
    if (!data.crewLog.entries.every(isCrewActivityShape)) return null;
  }
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
      "Unrecognized team bundle. Expected grok-forge-team-bundle v1.0/v1.1.",
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

export type BundleDiffRow = {
  id: string;
  status: BundleEntryImportStatus;
  incoming: TeamBundleEntry;
  existing?: TeamBundleEntry;
  claimChanged: boolean;
};

export type BundleImportDiff = {
  additions: BundleDiffRow[];
  duplicates: BundleDiffRow[];
  invalid: BundleDiffRow[];
};

export type BundleImportPreview = {
  team: string;
  exportedAt: string;
  forgeVersion: string;
  missions: BundleImportPreviewMission[];
  diff: BundleImportDiff;
  crewLogCount: number;
  stats: {
    total: number;
    new: number;
    duplicate: number;
    invalid: number;
    changed: number;
    explorations: number;
    pinned: number;
    crewLog: number;
  };
};

function isImportableBundleEntry(entry: TeamBundleEntry): boolean {
  return Boolean(entry.id?.trim() && entry.claim?.trim() && entry.type?.trim());
}

function toPreviewLedgerEntry(
  entry: Record<string, unknown>,
): TeamBundleEntry | null {
  if (
    typeof entry.id !== "string" ||
    typeof entry.ts !== "string" ||
    typeof entry.type !== "string" ||
    typeof entry.claim !== "string"
  ) {
    return null;
  }
  return toTeamBundleEntry(entry);
}

export function buildBundleDiffRow(
  incoming: TeamBundleEntry,
  existingById: Map<string, TeamBundleEntry>,
): BundleDiffRow {
  if (!isImportableBundleEntry(incoming)) {
    return {
      id: incoming.id || "invalid",
      status: "invalid",
      incoming,
      claimChanged: false,
    };
  }

  const existing = existingById.get(incoming.id);
  if (!existing) {
    return {
      id: incoming.id,
      status: "new",
      incoming,
      claimChanged: false,
    };
  }

  return {
    id: incoming.id,
    status: "duplicate",
    incoming,
    existing,
    claimChanged: existing.claim.trim() !== incoming.claim.trim(),
  };
}

export function buildBundleImportPreview(
  bundle: TeamBundle,
  existingById: Map<string, TeamBundleEntry>,
): BundleImportPreview {
  const annotate = (entry: TeamBundleEntry): BundleImportPreviewEntry => {
    const row = buildBundleDiffRow(entry, existingById);
    return { ...entry, status: row.status };
  };

  const diffRows = bundle.memory.entries.map((entry) =>
    buildBundleDiffRow(entry, existingById),
  );

  const diff: BundleImportDiff = {
    additions: diffRows.filter((r) => r.status === "new"),
    duplicates: diffRows.filter((r) => r.status === "duplicate"),
    invalid: diffRows.filter((r) => r.status === "invalid"),
  };

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

  const newCount = diff.additions.length;
  const duplicateCount = diff.duplicates.length;
  const invalidCount = diff.invalid.length;
  const changedCount = diff.duplicates.filter((r) => r.claimChanged).length;

  const crewLogCount = bundle.crewLog?.entries.length ?? 0;

  return {
    team: bundle.team.label,
    exportedAt: bundle.exportedAt,
    forgeVersion: bundle.forge.version,
    missions,
    diff,
    crewLogCount,
    stats: {
      total: bundle.stats.total,
      new: newCount,
      duplicate: duplicateCount,
      invalid: invalidCount,
      changed: changedCount,
      explorations: bundle.stats.explorations,
      pinned: bundle.stats.pinned,
      crewLog: crewLogCount,
    },
  };
}

export async function fetchLedgerEntryMap(
  limit = 500,
): Promise<Map<string, TeamBundleEntry>> {
  const res = await fetch(`/api/ledger?limit=${limit}`);
  if (!res.ok) return new Map();

  const data = (await res.json()) as {
    entries?: Array<Record<string, unknown>>;
  };

  const map = new Map<string, TeamBundleEntry>();
  for (const raw of data.entries ?? []) {
    const entry = toPreviewLedgerEntry(raw);
    if (entry) map.set(entry.id, entry);
  }
  return map;
}

/** @deprecated Use fetchLedgerEntryMap */
export async function fetchLedgerEntryIds(limit = 500): Promise<Set<string>> {
  const map = await fetchLedgerEntryMap(limit);
  return new Set(map.keys());
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

export type BundleCompareSide = {
  team: string;
  exportedAt: string;
  forgeVersion: string;
  stats: {
    total: number;
    explorations: number;
    pinned: number;
    crewLog: number;
  };
};

export type BundleMemoryCompareRow = {
  id: string;
  entry: TeamBundleEntry;
};

export type BundleMemoryConflictRow = {
  id: string;
  entryA: TeamBundleEntry;
  entryB: TeamBundleEntry;
};

export type BundleCompareMemoryDiff = {
  onlyInA: BundleMemoryCompareRow[];
  onlyInB: BundleMemoryCompareRow[];
  unchanged: BundleMemoryCompareRow[];
  claimChanged: BundleMemoryConflictRow[];
};

export type BundleCrewCompareRow = {
  id: string;
  activity: CrewActivity;
};

export type BundleCrewConflictRow = {
  id: string;
  activityA: CrewActivity;
  activityB: CrewActivity;
};

export type BundleCompareCrewDiff = {
  onlyInA: BundleCrewCompareRow[];
  onlyInB: BundleCrewCompareRow[];
  unchanged: BundleCrewCompareRow[];
  summaryChanged: BundleCrewConflictRow[];
};

export type TeamBundleCompare = {
  sideA: BundleCompareSide;
  sideB: BundleCompareSide;
  memory: BundleCompareMemoryDiff;
  crew?: BundleCompareCrewDiff;
  stats: {
    onlyInA: number;
    onlyInB: number;
    sharedUnchanged: number;
    claimChanged: number;
    crewOnlyInA: number;
    crewOnlyInB: number;
    crewUnchanged: number;
    crewSummaryChanged: number;
  };
};

function bundleCompareSide(bundle: TeamBundle): BundleCompareSide {
  return {
    team: bundle.team.label,
    exportedAt: bundle.exportedAt,
    forgeVersion: bundle.forge.version,
    stats: {
      total: bundle.stats.total,
      explorations: bundle.stats.explorations,
      pinned: bundle.stats.pinned,
      crewLog: bundle.crewLog?.entries.length ?? 0,
    },
  };
}

function compareBundleMemory(
  a: TeamBundle,
  b: TeamBundle,
): BundleCompareMemoryDiff {
  const mapA = new Map(a.memory.entries.map((e) => [e.id, e]));
  const mapB = new Map(b.memory.entries.map((e) => [e.id, e]));

  const onlyInA: BundleMemoryCompareRow[] = [];
  const onlyInB: BundleMemoryCompareRow[] = [];
  const unchanged: BundleMemoryCompareRow[] = [];
  const claimChanged: BundleMemoryConflictRow[] = [];

  for (const [id, entryA] of mapA) {
    const entryB = mapB.get(id);
    if (!entryB) {
      onlyInA.push({ id, entry: entryA });
    } else if (entryA.claim.trim() === entryB.claim.trim()) {
      unchanged.push({ id, entry: entryA });
    } else {
      claimChanged.push({ id, entryA, entryB });
    }
  }

  for (const [id, entryB] of mapB) {
    if (!mapA.has(id)) {
      onlyInB.push({ id, entry: entryB });
    }
  }

  return { onlyInA, onlyInB, unchanged, claimChanged };
}

function compareBundleCrew(
  a: TeamBundle,
  b: TeamBundle,
): BundleCompareCrewDiff | undefined {
  const crewA = a.crewLog?.entries ?? [];
  const crewB = b.crewLog?.entries ?? [];
  if (!crewA.length && !crewB.length) return undefined;

  const mapA = new Map(crewA.map((c) => [c.id, c]));
  const mapB = new Map(crewB.map((c) => [c.id, c]));

  const onlyInA: BundleCrewCompareRow[] = [];
  const onlyInB: BundleCrewCompareRow[] = [];
  const unchanged: BundleCrewCompareRow[] = [];
  const summaryChanged: BundleCrewConflictRow[] = [];

  for (const [id, activityA] of mapA) {
    const activityB = mapB.get(id);
    if (!activityB) {
      onlyInA.push({ id, activity: activityA });
    } else if (activityA.summary.trim() === activityB.summary.trim()) {
      unchanged.push({ id, activity: activityA });
    } else {
      summaryChanged.push({ id, activityA, activityB });
    }
  }

  for (const [id, activityB] of mapB) {
    if (!mapA.has(id)) {
      onlyInB.push({ id, activity: activityB });
    }
  }

  return { onlyInA, onlyInB, unchanged, summaryChanged };
}

/** Suggest which bundle to import after compare (ledger new count, uniqueness, recency) */
export function suggestCompareImportSide(
  compare: TeamBundleCompare,
  bundleA: TeamBundle,
  bundleB: TeamBundle,
  previewA?: BundleImportPreview | null,
  previewB?: BundleImportPreview | null,
): "A" | "B" | null {
  const newA = previewA?.stats.new ?? 0;
  const newB = previewB?.stats.new ?? 0;
  if (newA > newB) return "A";
  if (newB > newA) return "B";

  if (compare.stats.onlyInA > compare.stats.onlyInB) return "A";
  if (compare.stats.onlyInB > compare.stats.onlyInA) return "B";

  const dateA = new Date(bundleA.exportedAt).getTime();
  const dateB = new Date(bundleB.exportedAt).getTime();
  if (dateA > dateB) return "A";
  if (dateB > dateA) return "B";

  return null;
}

/** Compare two team bundles — memory by id, optional crew log diff */
export function compareTeamBundles(
  a: TeamBundle,
  b: TeamBundle,
): TeamBundleCompare {
  const memory = compareBundleMemory(a, b);
  const crew = compareBundleCrew(a, b);

  return {
    sideA: bundleCompareSide(a),
    sideB: bundleCompareSide(b),
    memory,
    crew,
    stats: {
      onlyInA: memory.onlyInA.length,
      onlyInB: memory.onlyInB.length,
      sharedUnchanged: memory.unchanged.length,
      claimChanged: memory.claimChanged.length,
      crewOnlyInA: crew?.onlyInA.length ?? 0,
      crewOnlyInB: crew?.onlyInB.length ?? 0,
      crewUnchanged: crew?.unchanged.length ?? 0,
      crewSummaryChanged: crew?.summaryChanged.length ?? 0,
    },
  };
}