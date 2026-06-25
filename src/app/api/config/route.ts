import { FORGE } from "@/lib/constants";
import { getForgeConfig } from "@/lib/forge-config";
import { getStudioSkills } from "@/lib/skills";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const config = getForgeConfig();

  return NextResponse.json({
    forge: {
      name: FORGE.name,
      version: FORGE.version,
      tagline: FORGE.tagline,
      project: config.project,
      githubUrl: config.githubUrl,
    },
    pack: config.pack,
    ledgerEnabled: config.ledgerEnabled,
    skills: getStudioSkills(config.pack).map((s) => ({
      id: s.id,
      title: s.title,
      titleZh: s.titleZh,
      desc: s.desc,
      descZh: s.descZh,
      tags: s.tags,
    })),
  });
}