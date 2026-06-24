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

export function useForgeChat(locale: Locale, greeting: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: greeting },
  ]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredChat;
        if (parsed.messages?.length) {
          setMessages(parsed.messages);
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

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