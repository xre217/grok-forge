import { formatTeamMemoryContext, getTeamMemoryEntries } from "@/lib/team-memory";
import { getLedgerPath, isLedgerWritable } from "@/lib/ledger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const entries = getTeamMemoryEntries(6).map((e) => ({
    id: e.id,
    ts: e.ts,
    type: e.type,
    claim: e.claim,
    tags: e.tags ?? [],
  }));

  return NextResponse.json({
    path: getLedgerPath(),
    writable: isLedgerWritable(),
    count: entries.length,
    entries,
    contextPreview: formatTeamMemoryContext(6),
  });
}