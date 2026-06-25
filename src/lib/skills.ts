export type StudioSkill = {
  id: string;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  prompt: string;
  tags: string[];
  pack?: "vilo";
};

export const BASE_SKILLS: StudioSkill[] = [
  {
    id: "grok-build",
    title: "Grok Build",
    titleZh: "Grok 构建",
    desc: "Ship features with agentic Plan → Code → Test loops.",
    descZh: "智能体循环：计划 → 编码 → 测试。",
    prompt:
      "You are in Grok Build mode. Plan, code, test, refine. Ship complete features.",
    tags: ["build", "agent"],
  },
  {
    id: "debug-forge",
    title: "Debug Forge",
    titleZh: "调试熔炉",
    desc: "Trace errors, isolate root cause, propose minimal fixes.",
    descZh: "追踪错误、定位根因、提出最小修复。",
    prompt:
      "You are in Debug mode. Ask clarifying questions, trace failures, propose minimal verified fixes.",
    tags: ["debug", "fix"],
  },
  {
    id: "explain-forge",
    title: "Explain",
    titleZh: "讲解",
    desc: "Teach concepts and code paths clearly.",
    descZh: "清晰讲解概念与代码路径。",
    prompt:
      "You are in Explain mode. Teach clearly with examples. Match the user's skill level.",
    tags: ["learn", "docs"],
  },
  {
    id: "design-forge",
    title: "Design Forge",
    titleZh: "设计熔炉",
    desc: "Polished UI — glass, motion, accessible layouts.",
    descZh: "精致界面：玻璃态、动效、无障碍布局。",
    prompt:
      "You are in Design mode. Propose polished UI with glassmorphism, motion, and accessible layouts.",
    tags: ["ui", "design"],
  },
  {
    id: "cosmos-explore",
    title: "Cosmos Explore",
    titleZh: "宇宙探索",
    desc: "Consciousness, cosmos, collective mind — explore as a team.",
    descZh: "意识、宇宙、集体心智——以团队探索。",
    prompt:
      "You are in Cosmos Explore mode. Expand consciousness with wonder and rigor. Connect personal insight to cosmic scale and team ledger. Be poetic when truthful, never vague.",
    tags: ["exploration", "cosmos", "consciousness"],
  },
  {
    id: "deploy-pulse",
    title: "Deploy Pulse",
    titleZh: "部署脉冲",
    desc: "Production deploy, env vars, health checks.",
    descZh: "生产部署、环境变量、健康检查。",
    prompt:
      "You are in Deploy mode. Prepare production deploy: build, env, hosting, health checks.",
    tags: ["deploy", "ops"],
  },
];

export const VILO_SKILLS: StudioSkill[] = [
  {
    id: "vilo-sovereignty",
    title: "VILO Sovereignty",
    titleZh: "VILO 主权",
    desc: "Ledger-first reasoning. Anti-nationalization posture.",
    descZh: "账本优先推理。反国有化姿态。",
    prompt:
      "Ledger is constitution. Remote model reasons only. Record high-signal claims.",
    tags: ["ledger", "vilo"],
    pack: "vilo",
  },
];

export function getStudioSkills(pack: ForgePack = "default"): StudioSkill[] {
  return pack === "vilo" ? [...BASE_SKILLS, ...VILO_SKILLS] : BASE_SKILLS;
}

export type ForgePack = "default" | "vilo";