import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

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

const MODES = ["observe", "plan", "execute", "verify"] as const;

function recommend(
  mode: string,
  urgency: number,
  uncertainty: number,
  exploration: number,
): string {
  if (uncertainty > 0.72) {
    return "Gather more runtime evidence before making broad changes.";
  }
  if (urgency > 0.72) {
    return "Act on the smallest useful next step and verify immediately.";
  }
  if (exploration > 0.66) {
    return "Explore adjacent tools or repos for a better integration point.";
  }
  return `Proceed in ${mode} mode with tight feedback loops.`;
}

export function deterministicThrmlSignal(
  prompt: string,
  reason = "Node deterministic fallback",
): ThrmlSignal {
  const digest = createHash("sha256").update(prompt).digest();
  const urgency = Math.round((digest[0] / 255) * 1000) / 1000;
  const uncertainty = Math.round((digest[1] / 255) * 1000) / 1000;
  const exploration = Math.round((digest[2] / 255) * 1000) / 1000;
  const mode = MODES[digest[3] % MODES.length];

  return {
    engine: "deterministic-fallback",
    using_thrml: false,
    reason,
    mode,
    scores: { urgency, uncertainty, exploration },
    recommendation: recommend(mode, urgency, uncertainty, exploration),
  };
}

async function thrmlFromPython(prompt: string): Promise<ThrmlSignal | null> {
  const scriptPath = path.join(process.cwd(), "scripts", "thrml_signal.py");
  if (!existsSync(scriptPath)) return null;

  const localPython = path.join(process.cwd(), ".venv", "bin", "python");
  const python =
    process.env.THRML_PYTHON ?? (existsSync(localPython) ? localPython : "python3");

  return new Promise((resolve) => {
    const child = spawn(python, [scriptPath], {
      env: {
        ...process.env,
        ...(process.env.THRML_REPO_PATH?.trim()
          ? { THRML_REPO_PATH: process.env.THRML_REPO_PATH.trim() }
          : {}),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      resolve(null);
    }, 8_000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", () => {
      clearTimeout(timeout);
      resolve(null);
    });

    child.on("close", () => {
      clearTimeout(timeout);
      try {
        resolve(JSON.parse(stdout) as ThrmlSignal);
      } catch {
        resolve(
          deterministicThrmlSignal(
            prompt,
            stderr || stdout || "THRML bridge parse failed",
          ),
        );
      }
    });

    child.stdin.end(JSON.stringify({ prompt }));
  });
}

export async function getThrmlSignal(prompt: string): Promise<ThrmlSignal> {
  const text = prompt.trim() || "Local Forge studio session";
  const fromPython = await thrmlFromPython(text);
  if (fromPython) return fromPython;
  return deterministicThrmlSignal(text, "THRML Python bridge unavailable — using hash fallback");
}