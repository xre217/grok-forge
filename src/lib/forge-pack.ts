import type { ForgePack } from "@/lib/skills";

export function getClientForgePack(): ForgePack {
  return process.env.NEXT_PUBLIC_FORGE_PACK === "vilo" ? "vilo" : "default";
}