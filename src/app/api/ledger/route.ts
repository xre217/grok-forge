import {
  appendLedgerEntry,
  getLedgerPath,
  getLedgerStats,
  getRecentLedgerEntries,
  isLedgerWritable,
} from "@/lib/ledger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number(searchParams.get("limit") ?? 12),
    50,
  );

  const entries = getRecentLedgerEntries(limit);
  const stats = getLedgerStats();

  return NextResponse.json({
    path: getLedgerPath(),
    stats,
    entries,
  });
}

export async function POST(request: Request) {
  if (!isLedgerWritable()) {
    return NextResponse.json(
      { error: "Ledger writes disabled. Set FORGE_LEDGER_ENABLED=1." },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      type?: string;
      claim?: string;
      evidence?: string;
      confidence?: number;
      tags?: string[];
    };

    if (!body.type?.trim() || !body.claim?.trim()) {
      return NextResponse.json(
        { error: "type and claim are required" },
        { status: 400 },
      );
    }

    const entry = appendLedgerEntry({
      type: body.type.trim(),
      claim: body.claim.trim(),
      evidence: body.evidence?.trim(),
      confidence: body.confidence,
      tags: body.tags,
    });

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Ledger write failed",
      },
      { status: 500 },
    );
  }
}