"use client";

import { ChatPanel } from "@/components/forge/chat-panel";
import { CommandPalette } from "@/components/forge/command-palette";
import { ExportToast } from "@/components/forge/export-toast";
import { GoldParticleCanvas } from "@/components/forge/gold-particle-canvas";
import { SkillsRail } from "@/components/forge/skills-rail";
import { Button } from "@/components/ui/button";
import { useSessionExport } from "@/hooks/use-session-export";
import { FORGE, ROUTES, STUDIO_SKILLS } from "@/lib/constants";
import type { Locale, StudioPanel } from "@/types/forge";
import confetti from "canvas-confetti";
import { Download, Languages, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export function ForgeStudio() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activePanel, setActivePanel] = useState<StudioPanel>("chat");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [toastFile, setToastFile] = useState<string | null>(null);

  const { exportSession, isExporting } = useSessionExport({
    locale,
    activePanel,
    activeSkill,
  });

  const skillPrompt = useMemo(() => {
    if (!activeSkill) return undefined;
    const skill = STUDIO_SKILLS.find((s) => s.id === activeSkill);
    return skill?.prompt;
  }, [activeSkill]);

  const newChat = () => {
    setActiveSkill(null);
    setActivePanel("chat");
  };

  const handleExport = useCallback(async () => {
    const filename = await exportSession();
    if (filename) {
      setToastFile(filename);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.92, y: 0.92 },
        colors: ["#d4af37", "#b8860b", "#fff4b8"],
      });
    }
  }, [exportSession]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        void handleExport();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleExport]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--forge-void)]">
      <GoldParticleCanvas
        className="opacity-40"
        particleCount={60}
        magnetism={0.008}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-white/5 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.home}
            className="text-sm font-semibold text-[var(--forge-gold)]"
          >
            {FORGE.name}
          </Link>
          <span className="hidden text-xs text-white/30 sm:inline">/ studio</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            LOCAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
            onClick={() => setLocale((l) => (l === "en" ? "zh" : "en"))}
          >
            <Languages className="size-4" />
            {locale === "en" ? "中文" : "EN"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="border-white/10 bg-white/5 text-white/70"
            onClick={() => void handleExport()}
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {locale === "zh" ? "导出" : "Export"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-white/5 text-white/70"
            onClick={newChat}
          >
            <Plus className="size-4" />
            {locale === "zh" ? "新对话" : "New"}
          </Button>
          <kbd className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/40 sm:inline">
            ⌘K
          </kbd>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 gap-4 overflow-hidden p-4">
        <SkillsRail
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          activeSkill={activeSkill}
          onSkillSelect={setActiveSkill}
          locale={locale}
        />
        <ChatPanel
          locale={locale}
          activePanel={activePanel}
          activeSkill={activeSkill}
          skillPrompt={skillPrompt}
        />
      </div>

      <CommandPalette
        onPanelChange={setActivePanel}
        onNewChat={newChat}
        onToggleLocale={() =>
          setLocale((l) => (l === "en" ? "zh" : "en"))
        }
        onExport={() => void handleExport()}
        locale={locale}
      />

      <ExportToast
        filename={toastFile}
        locale={locale}
        onDismiss={() => setToastFile(null)}
      />
    </div>
  );
}