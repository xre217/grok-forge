"use client";

import { MagneticNavRail } from "@/components/forge/magnetic-nav-rail";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { STUDIO_SKILLS } from "@/lib/constants";
import type { StudioPanel } from "@/types/forge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Cpu, Wand2 } from "lucide-react";
import { useMagneticTilt } from "@/hooks/use-magnetic-tilt";

type SkillsRailProps = {
  activePanel: StudioPanel;
  onPanelChange: (panel: StudioPanel) => void;
  activeSkill: string | null;
  onSkillSelect: (id: string) => void;
  locale: "en" | "zh";
};

function MagneticSkillCard({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { ref, style, onMove, onLeave } = useMagneticTilt({
    magnetism: 0.12,
    tilt: 5,
  });

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.99 }}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "forge-glass w-full rounded-xl p-3 text-left transition-all hover:border-[var(--forge-gold)]/25",
          active &&
            "border-[var(--forge-gold)]/40 shadow-[0_0_24px_var(--forge-gold-glow)]",
        )}
      >
        {children}
      </button>
    </motion.div>
  );
}

export function SkillsRail({
  activePanel,
  onPanelChange,
  activeSkill,
  onSkillSelect,
  locale,
}: SkillsRailProps) {
  return (
    <aside
      className="magnetic-nav-rail-shell forge-glass flex h-full w-[17.5rem] shrink-0 flex-col rounded-2xl border-white/5 p-3"
      style={{ perspective: 1200 }}
    >
      <div className="mb-3 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--forge-gold-dim)]">
          {locale === "zh" ? "导航" : "Navigate"}
        </p>
      </div>

      <MagneticNavRail
        activePanel={activePanel}
        onPanelChange={onPanelChange}
        locale={locale}
      />

      <div className="mb-2 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--forge-gold-dim)]">
          {locale === "zh" ? "技能库" : "Skill Library"}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 pr-2">
          {STUDIO_SKILLS.map((skill) => (
            <MagneticSkillCard
              key={skill.id}
              active={activeSkill === skill.id}
              onClick={() => {
                onSkillSelect(skill.id);
                onPanelChange("chat");
              }}
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
            </MagneticSkillCard>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
        <Cpu className="size-3.5 text-[var(--forge-gold-dim)]" />
        <span>
          ⌘K · 1–4 {locale === "zh" ? "切换面板" : "panels"}
        </span>
      </div>
    </aside>
  );
}