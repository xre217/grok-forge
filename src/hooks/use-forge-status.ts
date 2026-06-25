"use client";

import type { EngineSnapshot } from "@/lib/engine-status";
import { useEffect, useState } from "react";

export type ForgeRuntimeStatus = {
  mode: string;
  localFirst: boolean;
  engine: EngineSnapshot;
  reasoner: {
    provider: string;
    model: string;
    models?: string[];
    display?: string;
  };
  ollama: { available: boolean; models?: string[] };
  grok: { configured: boolean; active: boolean; note: string };
  ledger: { path: string; total: number };
  hosting: { command: string; port: number };
};

export function useForgeStatus() {
  const [status, setStatus] = useState<ForgeRuntimeStatus | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => setStatus(data as ForgeRuntimeStatus))
      .catch(() => null);
  }, []);

  return status;
}