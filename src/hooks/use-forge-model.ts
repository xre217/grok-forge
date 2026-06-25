"use client";

import { useCallback, useEffect, useState } from "react";

export const MODEL_STORAGE_KEY = "grok-forge:ollama-model";

export function useForgeModel(defaultModel = "llama3.2:3b") {
  const [model, setModelState] = useState(defaultModel);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MODEL_STORAGE_KEY);
      if (stored) setModelState(stored);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setModel = useCallback((next: string) => {
    setModelState(next);
    localStorage.setItem(MODEL_STORAGE_KEY, next);
  }, []);

  return { model, setModel, hydrated };
}