import {
  getLedgerPath,
  getLedgerStats,
  getRecentLedgerEntries,
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