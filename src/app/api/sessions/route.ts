import fs from "fs";
import path from "path";
import { getSessionsDir } from "@/lib/forge-home";
import { validateSessionBundle } from "@/lib/session-import";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const dir = getSessionsDir();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      return { name, size: stat.size, mtime: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.mtime.localeCompare(a.mtime))
    .slice(0, 20);

  return NextResponse.json({ dir, files });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bundle = validateSessionBundle(body);
    if (!bundle) {
      return NextResponse.json(
        { error: "Invalid session bundle format" },
        { status: 400 },
      );
    }

    const stamp = bundle.exportedAt.replace(/[:.]/g, "-").slice(0, 19);
    const filename = `grok-forge-session-${stamp}.json`;
    const full = path.join(getSessionsDir(), filename);

    fs.writeFileSync(full, JSON.stringify(bundle, null, 2), "utf8");

    return NextResponse.json({ ok: true, path: full, filename });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Session backup failed",
      },
      { status: 500 },
    );
  }
}