export type Locale = "en" | "zh";

export type ForgeTheme = "arc" | "midnight" | "ember";

export type StudioPanel = "chat" | "skills" | "ledger" | "deploy" | "explore";

export type SessionChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type SessionExportBundle = {
  format: "grok-forge-session";
  version: "1.0";
  exportedAt: string;
  project: string;
  forge: {
    name: string;
    version: string;
    tagline: string;
  };
  session: {
    locale: Locale;
    activePanel: StudioPanel;
    activeSkill: string | null;
    messageCount: number;
    messages: SessionChatMessage[];
  };
  runtime: Record<string, unknown>;
  thrml: Record<string, unknown> | null;
  ledger: {
    path: string;
    stats: Record<string, unknown>;
    slice: Array<Record<string, unknown>>;
  };
  summary: string;
};