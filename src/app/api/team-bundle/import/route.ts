import { importLedgerEntries } from "@/lib/ledger";
import { validateTeamBundle } from "@/lib/team-bundle";
import type { TeamBundleEntry } from "@/types/forge";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { bundle?: unknown };
    const bundle = validateTeamBundle(body.bundle);
    if (!bundle) {
      return NextResponse.json(
        { error: "Invalid team bundle. Expected grok-forge-team-bundle v1.0/v1.1." },
        { status: 400 },
      );
    }

    if (!bundle.memory.entries.length) {
      return NextResponse.json(
        { error: "Team bundle has no memory entries." },
        { status: 400 },
      );
    }

    const result = importLedgerEntries(
      bundle.memory.entries as TeamBundleEntry[],
    );

    return NextResponse.json({
      ok: true,
      imported: result.imported,
      skipped: result.skipped,
      missions: bundle.missions.length,
      exportedAt: bundle.exportedAt,
      team: bundle.team.label,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Team bundle import failed",
      },
      { status: 500 },
    );
  }
}