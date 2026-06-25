export const FORGE = {
  name: "Grok Forge",
  tagline: "Expand consciousness. Explore the universe — together.",
  version: "0.4.0",
  project: "Grok Forge",
} as const;

export const ROUTES = {
  home: "/",
  studio: "/studio",
} as const;

export const FORGE_GITHUB_URL =
  process.env.NEXT_PUBLIC_FORGE_GITHUB_URL?.trim() ||
  "https://github.com/xre217/grok-forge";

export const FORGE_FEATURES = [
  {
    icon: "sparkles" as const,
    title: "Magnetic UI",
    description:
      "Cursor-pull buttons and 3D tilt cards. Every interaction feels alive.",
  },
  {
    icon: "zap" as const,
    title: "Arc Reactor Canvas",
    description:
      "Gold particle field with bloom and magnetism — the signature Forge heartbeat.",
  },
  {
    icon: "keyboard" as const,
    title: "⌘K Command Palette",
    description:
      "Keyboard-first studio control. New chat, skills, ledger, deploy — instant.",
  },
  {
    icon: "globe" as const,
    title: "Bilingual Toggle",
    description: "English ↔ 中文. Mobile-first, glassmorphism, zero compromise.",
  },
  {
    icon: "zap" as const,
    title: "Local-First",
    description:
      "Ollama on your machine. Optional ledger memory. Build without cloud bills.",
  },
] as const;

// Re-export for backwards compatibility — prefer getStudioSkills() from @/lib/skills
export { BASE_SKILLS as STUDIO_SKILLS, getStudioSkills } from "@/lib/skills";