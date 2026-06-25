"use client";

import { MagneticNavItem } from "@/components/forge/magnetic-nav-item";
import type { Locale, StudioPanel } from "@/types/forge";
import {
  BookOpen,
  HardDrive,
  MessageSquare,
  Sparkles,
  Telescope,
} from "lucide-react";
import { LayoutGroup } from "framer-motion";
import { useEffect } from "react";

const PANELS: Array<{
  id: StudioPanel;
  icon: typeof MessageSquare;
  en: string;
  zh: string;
  shortcut: string;
}> = [
  { id: "chat", icon: MessageSquare, en: "Chat", zh: "对话", shortcut: "1" },
  { id: "skills", icon: Sparkles, en: "Skills", zh: "技能", shortcut: "2" },
  { id: "ledger", icon: BookOpen, en: "Ledger", zh: "账本", shortcut: "3" },
  { id: "deploy", icon: HardDrive, en: "Local", zh: "本地", shortcut: "4" },
  { id: "explore", icon: Telescope, en: "Explore", zh: "探索", shortcut: "5" },
];

type MagneticNavRailProps = {
  activePanel: StudioPanel;
  onPanelChange: (panel: StudioPanel) => void;
  locale: Locale;
};

export function MagneticNavRail({
  activePanel,
  onPanelChange,
  locale,
}: MagneticNavRailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const panel = PANELS.find((p) => p.shortcut === e.key);
      if (panel) {
        e.preventDefault();
        onPanelChange(panel.id);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPanelChange]);

  return (
    <LayoutGroup id="forge-nav">
      <nav
        className="magnetic-nav-rail mb-4 flex flex-col gap-1.5"
        aria-label={locale === "zh" ? "工作室导航" : "Studio navigation"}
      >
        {PANELS.map((panel) => (
          <MagneticNavItem
            key={panel.id}
            id={panel.id}
            label={locale === "zh" ? panel.zh : panel.en}
            icon={panel.icon}
            active={activePanel === panel.id}
            onClick={() => onPanelChange(panel.id)}
            shortcut={panel.shortcut}
          />
        ))}
      </nav>
    </LayoutGroup>
  );
}