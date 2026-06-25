import { FORGE } from "@/lib/constants";
import type { ThrmlSignal } from "@/lib/thrml-types";
import type {
  Locale,
  SessionChatMessage,
  SessionExportBundle,
  StudioPanel,
} from "@/types/forge";

export const CHAT_STORAGE_KEY = "grok-forge:chat";

type ExportInput = {
  locale: Locale;
  activePanel: StudioPanel;
  activeSkill: string | null;
  ledgerLimit?: number;
  thrml?: ThrmlSignal | null;
};

function readStoredMessages(): SessionChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { messages?: SessionChatMessage[] };
    return parsed.messages ?? [];
  } catch {
    return [];
  }
}

function buildSummary(bundle: Omit<SessionExportBundle, "summary">): string {
  const lines = [
    `# ${FORGE.name} Session Export`,
    ``,
    `Exported: ${bundle.exportedAt}`,
    `Project: ${bundle.project}`,
    `Locale: ${bundle.session.locale}`,
    `Messages: ${bundle.session.messageCount}`,
    `Active skill: ${bundle.session.activeSkill ?? "none"}`,
    `Ledger entries in slice: ${bundle.ledger.slice.length}`,
    `Ledger total: ${(bundle.ledger.stats as { total?: number }).total ?? "?"}`,
    `THRML mode: ${(bundle.thrml as { mode?: string } | null)?.mode ?? "n/a"}`,
    `Consciousness stream: ${bundle.consciousnessStream?.length ?? 0} entries`,
    ``,
    `## Chat`,
    ...bundle.session.messages.map(
      (m) => `**${m.role}**: ${m.content.slice(0, 500)}`,
    ),
    ``,
    `## Ledger slice`,
    ...bundle.ledger.slice.map((e) => {
      const entry = e as { ts?: string; type?: string; claim?: string };
      return `- [${entry.ts}] (${entry.type}) ${entry.claim}`;
    }),
  ];
  return lines.join("\n");
}

export async function buildSessionExport(
  input: ExportInput,
): Promise<SessionExportBundle> {
  const ledgerLimit = input.ledgerLimit ?? 24;
  const [statusRes, ledgerRes] = await Promise.all([
    fetch("/api/status"),
    fetch(`/api/ledger?limit=${ledgerLimit}`),
  ]);

  const runtime = statusRes.ok
    ? ((await statusRes.json()) as Record<string, unknown>)
    : { error: "status unavailable" };

  const ledgerData = ledgerRes.ok
    ? ((await ledgerRes.json()) as {
        path: string;
        stats: Record<string, unknown>;
        entries: Array<Record<string, unknown>>;
      })
    : { path: "", stats: {}, entries: [] };

  const messages = readStoredMessages();

  const STREAM_TAGS = new Set([
    "exploration",
    "consciousness",
    "cosmos",
    "universe",
    "collective",
    "starship",
    "team",
  ]);

  const consciousnessStream = ledgerData.entries.filter((e) => {
    const entry = e as { type?: string; tags?: string[] };
    return (
      entry.type === "exploration" ||
      entry.tags?.some((t) => STREAM_TAGS.has(t))
    );
  });

  const base = {
    format: "grok-forge-session" as const,
    version: "1.1" as const,
    exportedAt: new Date().toISOString(),
    project: FORGE.project,
    forge: {
      name: FORGE.name,
      version: FORGE.version,
      tagline: FORGE.tagline,
    },
    session: {
      locale: input.locale,
      activePanel: input.activePanel,
      activeSkill: input.activeSkill,
      messageCount: messages.length,
      messages,
    },
    runtime,
    thrml: input.thrml ?? null,
    ledger: {
      path: ledgerData.path,
      stats: ledgerData.stats,
      slice: ledgerData.entries,
    },
    consciousnessStream,
  };

  return { ...base, summary: buildSummary(base) };
}

export async function backupSessionToDisk(bundle: SessionExportBundle) {
  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundle),
    });
  } catch {
    // non-blocking — browser download still succeeds
  }
}

export function downloadSessionExport(bundle: SessionExportBundle) {
  const stamp = bundle.exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  const filename = `grok-forge-session-${stamp}.json`;
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return filename;
}