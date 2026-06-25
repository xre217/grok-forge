export type ThrmlSignal = {
  engine: string;
  using_thrml: boolean;
  reason?: string;
  mode: "observe" | "plan" | "execute" | "verify" | string;
  scores: {
    urgency: number;
    uncertainty: number;
    exploration: number;
  };
  recommendation: string;
};

export type ThrmlRuntimeInfo = {
  repoPath: string;
  repoConfigured: boolean;
  repoExists: boolean;
  bridgeScript: boolean;
  python: string;
  venvPython: boolean;
  expectedEngine: "thrml-ising" | "deterministic-fallback";
  setupReady: boolean;
};

export function formatThrmlEngineLabel(signal: ThrmlSignal): string {
  if (signal.using_thrml && signal.engine === "thrml-ising") {
    return "THRML Ising";
  }
  if (signal.using_thrml) return signal.engine;
  return "Hash fallback";
}