"use client";

import { logCrewActivity } from "@/lib/crew-activity";
import {
  applySessionImport,
  readSessionFile,
} from "@/lib/session-import";
import type { SessionImportResult } from "@/lib/session-import";
import { useCallback, useState } from "react";

export function useSessionImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importSession = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);
    try {
      const bundle = await readSessionFile(file);
      const result = applySessionImport(bundle);
      logCrewActivity(
        "session-import",
        `${result.messageCount} messages`,
        file.name,
      );
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Session import failed";
      setError(message);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return { importSession, isImporting, error };
}

export type { SessionImportResult };