"use client";

import { logCrewActivity } from "@/lib/crew-activity";
import { emitLedgerUpdated } from "@/lib/forge-events";
import {
  buildBundleImportPreview,
  buildTeamBundle,
  downloadTeamBundle,
  fetchLedgerEntryMap,
  readTeamBundleFile,
  type BundleImportPreview,
} from "@/lib/team-bundle";
import type { Locale, TeamBundle } from "@/types/forge";
import { useCallback, useState } from "react";

export type TeamBundleImportResult = {
  imported: number;
  skipped: number;
  missions: number;
  team: string;
  exportedAt: string;
};

export type StagedTeamBundleImport = {
  bundle: TeamBundle;
  preview: BundleImportPreview;
};

export function useTeamBundle(locale: Locale) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stagedImport, setStagedImport] = useState<StagedTeamBundleImport | null>(
    null,
  );

  const exportBundle = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const bundle = await buildTeamBundle(locale);
      if (!bundle.memory.entries.length) {
        throw new Error(
          locale === "zh"
            ? "没有可导出的团队记忆——先记录探索或固定回复。"
            : "No team memory to export — log an Explore mission or pin a reply first.",
        );
      }
      const filename = downloadTeamBundle(bundle);
      logCrewActivity(
        "bundle-export",
        `${bundle.stats.total} entries`,
        filename,
      );
      return { filename, count: bundle.stats.total };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Team bundle export failed";
      setError(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, [locale]);

  const commitImport = useCallback(async (bundle: TeamBundle) => {
    setIsImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/team-bundle/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle }),
      });

      const data = (await res.json()) as TeamBundleImportResult & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Team bundle import failed");
      }

      emitLedgerUpdated();
      logCrewActivity(
        "bundle-import",
        `${data.imported} imported, ${data.skipped} skipped`,
        data.team,
      );
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Team bundle import failed";
      setError(message);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const stageImport = useCallback(async (file: File) => {
    setError(null);
    try {
      const bundle = await readTeamBundleFile(file);
      const existingById = await fetchLedgerEntryMap();
      const preview = buildBundleImportPreview(bundle, existingById);
      setStagedImport({ bundle, preview });
      return { bundle, preview };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Team bundle import failed";
      setError(message);
      throw err;
    }
  }, []);

  const confirmStagedImport = useCallback(async () => {
    if (!stagedImport) return null;
    try {
      const result = await commitImport(stagedImport.bundle);
      setStagedImport(null);
      return result;
    } catch (err) {
      throw err;
    }
  }, [commitImport, stagedImport]);

  const cancelStagedImport = useCallback(() => {
    if (isImporting) return;
    setStagedImport(null);
  }, [isImporting]);

  return {
    exportBundle,
    stageImport,
    confirmStagedImport,
    cancelStagedImport,
    stagedImport,
    isExporting,
    isImporting,
    error,
  };
}