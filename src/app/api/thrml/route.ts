import { getThrmlSignal } from "@/lib/thrml";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const signal = await getThrmlSignal(body.prompt ?? "");
    return NextResponse.json(signal);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "THRML failed",
      },
      { status: 500 },
    );
  }
}