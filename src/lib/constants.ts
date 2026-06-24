export const FORGE = {
  name: "Grok Forge",
  tagline: "The Arc Reactor of Grok Studio",
  version: "0.1.0",
  project: "VILO v1.1",
} as const;

export const ROUTES = {
  home: "/",
  studio: "/studio",
} as const;

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
      "Gold particle field with bloom and magnetism — the signature Tre heartbeat.",
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
] as const;

export const STUDIO_SKILLS = [
  {
    id: "grok-build",
    title: "Grok Build",
    titleZh: "Grok 构建",
    desc: "Ship features with agentic Plan → Code → Test loops.",
    descZh: "智能体循环：计划 → 编码 → 测试。",
    prompt: "You are in Grok Build mode. Plan, code, test, refine. Ship complete features.",
    tags: ["build", "agent"],
  },
  {
    id: "vilo-sovereignty",
    title: "VILO Sovereignty",
    titleZh: "VILO 主权",
    desc: "Ledger-first reasoning. Anti-nationalization posture.",
    descZh: "账本优先推理。反国有化姿态。",
    prompt: "Ledger is constitution. Remote model reasons only. Record high-signal claims.",
    tags: ["ledger", "vilo"],
  },
  {
    id: "design-forge",
    title: "Design Forge",
    titleZh: "设计熔炉",
    desc: "Gold particles, glass, magnetic buttons — Tre signature UI.",
    descZh: "金粒子、玻璃态、磁吸按钮——Tre 签名风格。",
    prompt: "Apply Tre design system: gold canvas, glassmorphism, magnetic interactions.",
    tags: ["ui", "design"],
  },
  {
    id: "deploy-pulse",
    title: "Deploy Pulse",
    titleZh: "部署脉冲",
    desc: "Vercel production deploy, env vars, health checks.",
    descZh: "Vercel 生产部署、环境变量、健康检查。",
    prompt: "Prepare production deploy: build, env, Vercel, GitHub remote.",
    tags: ["vercel", "deploy"],
  },
] as const;