import { FORGE } from "@/lib/constants";
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: FORGE.name,
    version: FORGE.version,
    ts: new Date().toISOString(),
  });
}