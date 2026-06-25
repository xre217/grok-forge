import { mergeCrewActivities } from "@/lib/crew-activity";
import { CHAT_STORAGE_KEY } from "@/lib/session-export";
import type {
  Locale,
  SessionChatMessage,
  SessionExportBundle,
  StudioPanel,
} from "@/types/forge";

export type SessionImportResult = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
  messageCount: number;
  exportedAt: string;
  crewActivityMerged: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatMessage(value: unknown): value is SessionChatMessage {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string"
  );
}

export function validateSessionBundle(data: unknown): SessionExportBundle | null {
  if (!isRecord(data)) return null;
  if (data.format !== "grok-forge-session") return null;
  if (data.version !== "1.0" && data.version !== "1.1" && data.version !== "1.2") {
    return null;
  }
  if (typeof data.exportedAt !== "string") return null;
  if (!isRecord(data.session)) return null;

  const session = data.session;
  const locale = session.locale;
  if (locale !== "en" && locale !== "zh") return null;
  if (!Array.isArray(session.messages)) return null;
  if (!session.messages.every(isChatMessage)) return null;

  const activePanel = session.activePanel;
  const validPanels: StudioPanel[] = [
    "chat",
    "skills",
    "ledger",
    "deploy",
    "explore",
  ];
  if (
    typeof activePanel !== "string" ||
    !validPanels.includes(activePanel as StudioPanel)
  ) {
    return null;
  }

  return data as SessionExportBundle;
}

export function applySessionImport(
  bundle: SessionExportBundle,
): SessionImportResult {
  const payload = {
    messages: bundle.session.messages,
    locale: bundle.session.locale,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
  }

  const crewActivityMerged = mergeCrewActivities(bundle.crewActivity ?? []);

  return {
    locale: bundle.session.locale,
    activePanel: bundle.session.activePanel,
    activeSkill: bundle.session.activeSkill ?? null,
    messageCount: bundle.session.messages.length,
    exportedAt: bundle.exportedAt,
    crewActivityMerged,
  };
}

export async function readSessionFile(file: File): Promise<SessionExportBundle> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const bundle = validateSessionBundle(parsed);
  if (!bundle) {
    throw new Error(
      "Unrecognized session format. Expected grok-forge-session v1.0 export.",
    );
  }

  return bundle;
}