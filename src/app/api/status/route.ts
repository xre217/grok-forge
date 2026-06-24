import { FORGE } from "@/lib/constants";
import { isOllamaAvailable } from "@/lib/reasoning";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasXai = Boolean(process.env.XAI_API_KEY?.trim());
  const ollama = await isOllamaAvailable();

  return NextResponse.json({
    service: FORGE.name,
    version: FORGE.version,
    grok: {
      configured: hasXai,
      model: process.env.XAI_MODEL?.trim() || "grok-4.3",
      note: hasXai
        ? "Key present — verify credits at console.x.ai"
        : "Set XAI_API_KEY in .env.local",
    },
    ollama: { available: ollama },
    domain: process.env.FORGE_DOMAIN || "forge.trefong.com",
    vercel: { status: "blocked", reason: "team overdue balance" },
    dns: { type: "CNAME", host: "forge", value: "cname.vercel-dns.com" },
    ts: new Date().toISOString(),
  });
}