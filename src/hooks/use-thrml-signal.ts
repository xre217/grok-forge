"use client";

import type { ThrmlSignal } from "@/lib/thrml";
import { useCallback, useEffect, useState } from "react";

export function useThrmlSignal(initialPrompt = "Local Forge studio session") {
  const [signal, setSignal] = useState<ThrmlSignal | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (prompt: string) => {
    const text = prompt.trim() || initialPrompt;
    setLoading(true);
    try {
      const res = await fetch("/api/thrml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      if (res.ok) {
        setSignal((await res.json()) as ThrmlSignal);
      }
    } finally {
      setLoading(false);
    }
  }, [initialPrompt]);

  useEffect(() => {
    void refresh(initialPrompt);
  }, [initialPrompt, refresh]);

  return { signal, loading, refresh };
}