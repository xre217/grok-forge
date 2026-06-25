"use client";

import type { ChatMessage } from "@/components/forge/chat-panel";
import type { Locale } from "@/types/forge";
import { useCallback, useEffect, useState } from "react";

import { CHAT_STORAGE_KEY } from "@/lib/session-export";

const STORAGE_KEY = CHAT_STORAGE_KEY;

type StoredChat = {
  messages: ChatMessage[];
  locale: Locale;
};

function loadStoredMessages(): ChatMessage[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    return parsed.messages?.length ? parsed.messages : null;
  } catch {
    return null;
  }
}

export function useForgeChat(
  locale: Locale,
  greeting: string,
  reloadKey = 0,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: greeting },
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored) setMessages(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (reloadKey === 0) return;
    const stored = loadStoredMessages();
    if (stored) setMessages(stored);
  }, [reloadKey]);

  useEffect(() => {
    if (!hydrated) return;
    const payload: StoredChat = { messages, locale };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [messages, locale, hydrated]);

  const resetChat = useCallback(
    (greet: string) => {
      setMessages([{ id: "welcome", role: "assistant", content: greet }]);
    },
    [],
  );

  return { messages, setMessages, resetChat, hydrated };
}