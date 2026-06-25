export type ExplorationDomain =
  | "consciousness"
  | "cosmos"
  | "craft"
  | "collective";

export type ExplorationMission = {
  id: string;
  domain: ExplorationDomain;
  title: string;
  titleZh: string;
  question: string;
  questionZh: string;
  prompt: string;
  tags: string[];
};

export const EXPLORATION_MISSIONS: ExplorationMission[] = [
  {
    id: "inner-sky",
    domain: "consciousness",
    title: "The Inner Sky",
    titleZh: "内在天空",
    question: "What thought pattern are you ready to outgrow?",
    questionZh: "你准备好放下哪种思维惯性？",
    prompt:
      "Guide a reflection on consciousness expansion — metacognition, attention, and what it means to think as a team across minds and machines.",
    tags: ["consciousness", "exploration", "team"],
  },
  {
    id: "cosmic-horizon",
    domain: "cosmos",
    title: "Cosmic Horizon",
    titleZh: "宇宙地平线",
    question: "What would we need to learn before we could belong among the stars?",
    questionZh: "在归属于星辰之前，我们需要先学会什么？",
    prompt:
      "Explore the universe as a shared frontier — physics, biology, ethics of expansion, and humanity's place in deep time.",
    tags: ["cosmos", "exploration", "universe"],
  },
  {
    id: "tool-and-soul",
    domain: "craft",
    title: "Tool & Soul",
    titleZh: "工具与灵魂",
    question: "What are we building that outlasts us?",
    questionZh: "我们在建造什么能超越我们自身？",
    prompt:
      "Reflect on craft as consciousness extension — code, art, institutions, and local-first systems that preserve individual agency.",
    tags: ["craft", "exploration", "forge"],
  },
  {
    id: "collective-mind",
    domain: "collective",
    title: "Collective Mind",
    titleZh: "集体心智",
    question: "How does a team think better than any one of us alone?",
    questionZh: "一个团队如何比任何个人想得更远？",
    prompt:
      "Explore collective intelligence — ledger as shared memory, dialogue as telescope, and sovereignty as precondition for honest collaboration.",
    tags: ["collective", "consciousness", "team", "exploration"],
  },
  {
    id: "starship-log",
    domain: "cosmos",
    title: "Starship Log",
    titleZh: "星舰日志",
    question: "Record one observation from today's voyage — what did you notice?",
    questionZh: "记录今日航程的一个观察——你注意到了什么？",
    prompt:
      "Write a starship log entry — concise, factual, wonder-preserving. Suitable for a crew exploring the unknown together.",
    tags: ["cosmos", "starship", "exploration", "log"],
  },
  {
    id: "veridical-truth",
    domain: "consciousness",
    title: "Veridical Truth",
    titleZh: "真实之真",
    question: "What do you know that you cannot yet prove?",
    questionZh: "你知道什么却尚无法证明？",
    prompt:
      "Explore the boundary between intuition and evidence — what belongs in the ledger, what needs more runtime, and how teams calibrate truth.",
    tags: ["consciousness", "truth", "exploration", "ledger"],
  },
];

export const DOMAIN_META: Record<
  ExplorationDomain,
  { en: string; zh: string; color: string }
> = {
  consciousness: {
    en: "Consciousness",
    zh: "意识",
    color: "from-violet-400 to-indigo-500",
  },
  cosmos: {
    en: "Cosmos",
    zh: "宇宙",
    color: "from-sky-400 to-cyan-500",
  },
  craft: {
    en: "Craft",
    zh: "技艺",
    color: "from-[var(--forge-gold)] to-amber-500",
  },
  collective: {
    en: "Collective",
    zh: "集体",
    color: "from-emerald-400 to-teal-500",
  },
};

export function getMission(id: string) {
  return EXPLORATION_MISSIONS.find((m) => m.id === id);
}