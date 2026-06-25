export type Locale = "en" | "zh";

export type ForgeTheme = "arc" | "midnight" | "ember";

export type StudioPanel = "chat" | "skills" | "ledger" | "deploy" | "explore";

export type SessionChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type TeamBundleEntry = {
  id: string;
  ts: string;
  type: string;
  claim: string;
  evidence?: string;
  confidence?: number;
  tags?: string[];
  source?: string;
};

export type TeamBundleMissionSlice = {
  missionId: string;
  title: string;
  titleZh: string;
  domain: string;
  entryCount: number;
  entries: TeamBundleEntry[];
};

export type CrewActivityKind =
  | "pin"
  | "explore"
  | "bundle-export"
  | "bundle-import"
  | "session-export"
  | "session-import";

export type CrewActivity = {
  id: string;
  ts: string;
  kind: CrewActivityKind;
  summary: string;
  detail?: string;
};

export type TeamBundle = {
  format: "grok-forge-team-bundle";
  version: "1.0" | "1.1";
  exportedAt: string;
  forge: {
    name: string;
    version: string;
    tagline: string;
  };
  team: {
    label: string;
    locale: Locale;
  };
  memory: {
    entries: TeamBundleEntry[];
  };
  missions: TeamBundleMissionSlice[];
  stats: {
    explorations: number;
    pinned: number;
    total: number;
    crewLog?: number;
  };
  crewLog?: {
    entries: CrewActivity[];
  };
  summary: string;
};

export type SessionExportBundle = {
  format: "grok-forge-session";
  version: "1.0" | "1.1" | "1.2";
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
  consciousnessStream?: Array<Record<string, unknown>>;
  crewActivity?: CrewActivity[];
  summary: string;
};