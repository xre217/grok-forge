import fs from "fs";
import os from "os";
import path from "path";

export function getForgeHome() {
  const raw = process.env.FORGE_HOME?.trim();
  if (raw?.startsWith("~")) {
    return path.join(os.homedir(), raw.slice(1));
  }
  return raw || path.join(os.homedir(), ".forge");
}

export function getSessionsDir() {
  const dir = path.join(getForgeHome(), "sessions");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}