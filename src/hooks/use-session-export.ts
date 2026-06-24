"use client";

import {
  buildSessionExport,
  downloadSessionExport,
} from "@/lib/session-export";
import type { Locale, StudioPanel } from "@/types/forge";
import { useCallback, useState } from "react";

type UseSessionExportArgs = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
};

export function useSessionExport({
  locale,
  activePanel,
  activeSkill,
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
      });
      const filename = downloadSessionExport(bundle);
      setLastExport(filename);
      return filename;
    } finally {
      setIsExporting(false);
    }
  }, [locale, activePanel, activeSkill]);

  return { exportSession, isExporting, lastExport };
}