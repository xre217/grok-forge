"use client";

import type { ThrmlSignal } from "@/lib/thrml";
import { useCallback, useEffect, useRef, useState } from "react";

export function useThrmlSignal(initialPrompt = "Local Forge studio session") {
  const [signal, setSignal] = useState<ThrmlSignal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef(initialPrompt);

  const refresh = useCallback(async (prompt: string) => {
    const text = prompt.trim() || initialPrompt;
    lastPromptRef.current = text;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/thrml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal,
      });
      if (requestId !== requestIdRef.current) return;
      if (res.ok) {
        setSignal((await res.json()) as ThrmlSignal);
        setError(null);
        return;
      }

      let message = `THRML request failed (${res.status})`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // keep default message
      }
      setError(message);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "THRML request failed");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [initialPrompt]);

  const retry = useCallback(() => {
    void refresh(lastPromptRef.current);
  }, [refresh]);

  useEffect(() => {
    void refresh(initialPrompt);
  }, [initialPrompt, refresh]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { signal, loading, error, refresh, retry };
}