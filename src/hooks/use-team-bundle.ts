"use client";

import { emitLedgerUpdated } from "@/lib/forge-events";
import {
  buildTeamBundle,
  downloadTeamBundle,
  readTeamBundleFile,
} from "@/lib/team-bundle";
import type { Locale } from "@/types/forge";
import { useCallback, useState } from "react";

export type TeamBundleImportResult = {
  imported: number;
  skipped: number;
  missions: number;
  team: string;
  exportedAt: string;
};

export function useTeamBundle(locale: Locale) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const importBundle = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);
    try {
      const bundle = await readTeamBundleFile(file);
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

  return { exportBundle, importBundle, isExporting, isImporting, error };
}