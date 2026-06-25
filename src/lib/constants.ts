export const FORGE = {
  name: "Grok Forge",
  tagline: "Your local AI studio — chat, remember, explore, export.",
  version: "0.19.0",
  project: "Local AI Studio",
} as const;

export const ROUTES = {
  home: "/",
  studio: "/studio",
} as const;

export const FORGE_GITHUB_URL =
  process.env.NEXT_PUBLIC_FORGE_GITHUB_URL?.trim() ||
  "https://github.com/xre217/grok-forge";

export const FORGE_DEMO_URL = `${FORGE_GITHUB_URL}/blob/main/DEMO.md`;
export const FORGE_THRML_URL = `${FORGE_GITHUB_URL}/blob/main/THRML.md`;

/** Shown on landing — clarifies Forge ≠ Grok cloud app */
export const FORGE_CLARITY_LINE =
  "Not the Grok chatbot. Runs on Ollama by default. Grok API optional.";

export const FORGE_STEPS = [
  {
    step: "1",
    title: "Chat locally",
    description: "Ollama on your machine. No per-message cloud bill.",
  },
  {
    step: "2",
    title: "Remember what matters",
    description: "Pin insights and explorations — memory shapes every reply.",
  },
  {
    step: "3",
    title: "Share with your crew",
    description: "Team bundles for explorations + memory. Session export for full chat.",
  },
] as const;

export const FORGE_USE_CASES = [
  "Build & debug with skills",
  "Long-running project thinking",
  "Team memory via pins & explore",
  "Private AI without the cloud",
] as const;

export const FORGE_FEATURES = [
  {
    icon: "zap" as const,
    title: "Local Chat",
    description:
      "Ollama-first reasoning on your hardware. Hybrid cloud optional when you have credits.",
  },
  {
    icon: "brain" as const,
    title: "Team Memory",
    description:
      "Pin replies and log explorations. Citations show which entries shaped each reply.",
  },
  {
    icon: "telescope" as const,
    title: "Explore Missions",
    description:
      "Guided missions for deep topics — distill reflections straight into your ledger.",
  },
  {
    icon: "download" as const,
    title: "Team Bundles",
    description:
      "Export crew memory JSON. Import preview shows new vs duplicate before merge.",
  },
  {
    icon: "keyboard" as const,
    title: "Keyboard Studio",
    description:
      "⌘K command palette, model picker, bilingual UI. Built for daily use.",
  },
  {
    icon: "globe" as const,
    title: "Fork & Self-Host",
    description:
      "MIT licensed. Docker, VPS, or local dev. See DEMO.md for the full walkthrough.",
  },
] as const;

// Re-export for backwards compatibility — prefer getStudioSkills() from @/lib/skills
export { BASE_SKILLS as STUDIO_SKILLS, getStudioSkills } from "@/lib/skills";