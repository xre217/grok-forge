"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STUDIO_SKILLS } from "@/lib/constants";
import type { StudioPanel } from "@/types/forge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Cpu,
  MessageSquare,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";

const PANEL_ICONS = {
  chat: MessageSquare,
  skills: Sparkles,
  ledger: BookOpen,
  deploy: Rocket,
} as const;

type SkillsRailProps = {
  activePanel: StudioPanel;
  onPanelChange: (panel: StudioPanel) => void;
  activeSkill: string | null;
  onSkillSelect: (id: string) => void;
  locale: "en" | "zh";
};

export function SkillsRail({
  activePanel,
  onPanelChange,
  activeSkill,
  onSkillSelect,
  locale,
}: SkillsRailProps) {
  const labels = {
    chat: locale === "zh" ? "对话" : "Chat",
    skills: locale === "zh" ? "技能" : "Skills",
    ledger: locale === "zh" ? "账本" : "Ledger",
    deploy: locale === "zh" ? "部署" : "Deploy",
  };

  return (
    <aside className="forge-glass flex h-full w-64 shrink-0 flex-col rounded-2xl border-white/5 p-3">
      <div className="mb-3 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--forge-gold-dim)]">
          {locale === "zh" ? "面板" : "Panels"}
        </p>
      </div>

      <nav className="mb-4 flex flex-col gap-1">
        {(Object.keys(PANEL_ICONS) as StudioPanel[]).map((panel) => {
          const Icon = PANEL_ICONS[panel];
          return (
            <button
              key={panel}
              type="button"
              onClick={() => onPanelChange(panel)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                activePanel === panel
                  ? "bg-[var(--forge-gold)]/15 text-[var(--forge-gold)]"
                  : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {labels[panel]}
            </button>
          );
        })}
      </nav>

      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--forge-gold-dim)]">
          {locale === "zh" ? "技能库" : "Skill Library"}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 pr-2">
          {STUDIO_SKILLS.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => {
                onSkillSelect(skill.id);
                onPanelChange("chat");
              }}
              className={cn(
                "forge-glass rounded-xl p-3 text-left transition-all hover:border-[var(--forge-gold)]/30",
                activeSkill === skill.id &&
                  "border-[var(--forge-gold)]/40 shadow-[0_0_24px_var(--forge-gold-glow)]",
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <Wand2 className="size-3.5 text-[var(--forge-gold)]" />
                <span className="text-sm font-medium text-white">
                  {locale === "zh" ? skill.titleZh : skill.title}
                </span>
              </div>
              <p className="mb-2 text-xs leading-relaxed text-white/45">
                {locale === "zh" ? skill.descZh : skill.desc}
              </p>
              <div className="flex flex-wrap gap-1">
                {skill.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-5 bg-white/5 text-[10px] text-white/50"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
        <Cpu className="size-3.5 text-[var(--forge-gold-dim)]" />
        <span>⌘K {locale === "zh" ? "命令面板" : "command palette"}</span>
      </div>
    </aside>
  );
}