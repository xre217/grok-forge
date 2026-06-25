import {
  getCrewActivities,
  CREW_ACTIVITY_MAX,
  logCrewActivity,
  mergeCrewActivities,
  type CrewActivity,
} from "@/lib/crew-activity";
import { FORGE } from "@/lib/constants";
import type { CrewLogBundle, Locale } from "@/types/forge";

export type CrewLogExportScope = {
  filter: string;
  search: string;
  partial: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function countByKind(entries: CrewActivity[]) {
  let pins = 0;
  let explores = 0;
  let bundles = 0;
  let sessions = 0;
  let crewLog = 0;

  for (const entry of entries) {
    switch (entry.kind) {
      case "pin":
        pins++;
        break;
      case "explore":
        explores++;
        break;
      case "bundle-export":
      case "bundle-import":
        bundles++;
        break;
      case "session-export":
      case "session-import":
        sessions++;
        break;
      case "crew-log-export":
      case "crew-log-import":
        crewLog++;
        break;
    }
  }

  return { pins, explores, bundles, sessions, crewLog };
}

function buildSummary(
  bundle: Omit<CrewLogBundle, "summary">,
  scope?: CrewLogExportScope,
): string {
  const lines = [
    `# ${FORGE.name} Crew Log`,
    ``,
    `Exported: ${bundle.exportedAt}`,
    `Events: ${bundle.stats.total}`,
    `Pins: ${bundle.stats.pins} · Explore: ${bundle.stats.explores} · Bundles: ${bundle.stats.bundles} · Sessions: ${bundle.stats.sessions}`,
  ];

  if (scope?.partial) {
    lines.push(
      `Scope: filter=${scope.filter || "all"}${scope.search ? ` search="${scope.search}"` : ""}`,
    );
  }

  lines.push(
    ``,
    `## Events`,
    ...bundle.entries.map(
      (e) => `- [${e.ts}] (${e.kind}) ${e.summary}${e.detail ? ` — ${e.detail}` : ""}`,
    ),
  );

  return lines.join("\n");
}

export function buildCrewLogBundle(
  locale: Locale,
  entries?: CrewActivity[],
  scope?: CrewLogExportScope,
): CrewLogBundle {
  const resolved =
    entries ?? getCrewActivities(CREW_ACTIVITY_MAX);
  const counts = countByKind(resolved);

  const base = {
    format: "grok-forge-crew-log" as const,
    version: "1.0" as const,
    exportedAt: new Date().toISOString(),
    forge: {
      name: FORGE.name,
      version: FORGE.version,
      tagline: FORGE.tagline,
    },
    locale,
    entries: resolved,
    stats: {
      total: resolved.length,
      ...counts,
    },
    exportScope: scope?.partial ? scope : undefined,
  };

  return { ...base, summary: buildSummary(base, scope) };
}

export function downloadCrewLogBundle(bundle: CrewLogBundle): string {
  const stamp = bundle.exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  const filename = `grok-forge-crew-log-${stamp}.json`;
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

export function validateCrewLogBundle(data: unknown): CrewLogBundle | null {
  if (!isRecord(data)) return null;
  if (data.format !== "grok-forge-crew-log") return null;
  if (data.version !== "1.0") return null;
  if (typeof data.exportedAt !== "string") return null;
  if (data.locale !== "en" && data.locale !== "zh") return null;
  if (!Array.isArray(data.entries)) return null;
  if (!data.entries.every(isCrewActivityShape)) return null;
  return data as CrewLogBundle;
}

export async function readCrewLogFile(file: File): Promise<CrewLogBundle> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const bundle = validateCrewLogBundle(parsed);
  if (!bundle) {
    throw new Error(
      "Unrecognized crew log. Expected grok-forge-crew-log v1.0.",
    );
  }
  return bundle;
}

export function applyCrewLogImport(bundle: CrewLogBundle): {
  merged: number;
  total: number;
  skipped: number;
} {
  const merged = mergeCrewActivities(bundle.entries);
  const skipped = bundle.entries.length - merged;
  logCrewActivity(
    "crew-log-import",
    `${merged} merged, ${skipped} skipped`,
    bundle.exportedAt,
  );
  return { merged, total: bundle.entries.length, skipped };
}

export function exportAndDownloadCrewLog(
  locale: Locale,
  entries?: CrewActivity[],
  scope?: CrewLogExportScope,
): { filename: string; count: number } {
  const bundle = buildCrewLogBundle(locale, entries, scope);
  if (!bundle.entries.length) {
    throw new Error(
      locale === "zh"
        ? "没有可导出的团队日志事件。"
        : "No crew log events to export.",
    );
  }
  const filename = downloadCrewLogBundle(bundle);
  logCrewActivity(
    "crew-log-export",
    `${bundle.stats.total} events`,
    scope?.partial ? `filtered · ${filename}` : filename,
  );
  return { filename, count: bundle.stats.total };
}