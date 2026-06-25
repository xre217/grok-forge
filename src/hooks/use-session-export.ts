"use client";

import {
  backupSessionToDisk,
  buildSessionExport,
  downloadSessionExport,
} from "@/lib/session-export";
import type { ThrmlSignal } from "@/lib/thrml";
import type { Locale, StudioPanel } from "@/types/forge";
import { useCallback, useState } from "react";

type UseSessionExportArgs = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
  thrml?: ThrmlSignal | null;
};

export function useSessionExport({
  locale,
  activePanel,
  activeSkill,
  thrml,
}: UseSessionExportArgs) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const exportSession = useCallback(async () => {
    setIsExporting(true);
    try {
      const bundle = await buildSessionExport({
        locale,
        activePanel,
        activeSkill,
        ledgerLimit: 24,
        thrml,
      });
      const filename = downloadSessionExport(bundle);
      void backupSessionToDisk(bundle);
      setLastExport(filename);
      return filename;
    } finally {
      setIsExporting(false);
    }
  }, [locale, activePanel, activeSkill, thrml]);

  return { exportSession, isExporting, lastExport };
}