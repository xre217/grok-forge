"use client";

import { ChatPanel } from "@/components/forge/chat-panel";
import { CommandPalette } from "@/components/forge/command-palette";
import { ExportToast } from "@/components/forge/export-toast";
import { ForgeOnboarding } from "@/components/forge/forge-onboarding";
import { GoldParticleCanvas } from "@/components/forge/gold-particle-canvas";
import { SkillsRail } from "@/components/forge/skills-rail";
import { CrewActivityLog } from "@/components/forge/crew-activity-log";
import { ThrmlSignalBar } from "@/components/forge/thrml-signal-bar";
import { Button } from "@/components/ui/button";
import { RuntimeStatusChip } from "@/components/forge/runtime-status-chip";
import { useForgeStatus } from "@/hooks/use-forge-status";
import { useSessionExport } from "@/hooks/use-session-export";
import { useSessionImport } from "@/hooks/use-session-import";
import { useTeamBundle } from "@/hooks/use-team-bundle";
import { TeamBundleImportPreviewDialog } from "@/components/forge/team-bundle-import-preview";
import { validateTeamBundle } from "@/lib/team-bundle";
import { useThrmlSignal } from "@/hooks/use-thrml-signal";
import { FORGE, ROUTES } from "@/lib/constants";
import { getClientForgePack } from "@/lib/forge-pack";
import { getStudioSkills } from "@/lib/skills";
import type { ExplorationMission } from "@/lib/explorations";
import type { Locale, StudioPanel } from "@/types/forge";
import confetti from "canvas-confetti";
import { Download, Languages, Loader2, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_THRML_PROMPT = "Grok Forge studio session";

export function ForgeStudio() {
  const runtimeStatus = useForgeStatus();
  const [locale, setLocale] = useState<Locale>("en");
  const [activePanel, setActivePanel] = useState<StudioPanel>("chat");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    detail: string;
  } | null>(null);
  const [chatReloadKey, setChatReloadKey] = useState(0);
  const [exploreDiscuss, setExploreDiscuss] = useState<{
    mission: ExplorationMission;
    seed: string;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const studioSkills = useMemo(
    () => getStudioSkills(getClientForgePack()),
    [],
  );

  const {
    signal: thrmlSignal,
    loading: thrmlLoading,
    error: thrmlError,
    refresh: refreshThrml,
    retry: retryThrml,
  } = useThrmlSignal(DEFAULT_THRML_PROMPT);

  const { exportSession, isExporting } = useSessionExport({
    locale,
    activePanel,
    activeSkill,
    thrml: thrmlSignal,
  });

  const { importSession, isImporting } = useSessionImport();
  const {
    exportBundle,
    stageImport,
    confirmStagedImport,
    cancelStagedImport,
    stagedImport,
    isImporting: isTeamBundleImporting,
  } = useTeamBundle(locale);

  const skillPrompt = useMemo(() => {
    if (!activeSkill) return undefined;
    const skill = studioSkills.find((s) => s.id === activeSkill);
    return skill?.prompt;
  }, [activeSkill, studioSkills]);

  useEffect(() => {
    if (skillPrompt) {
      void refreshThrml(skillPrompt);
      return;
    }
    void refreshThrml(DEFAULT_THRML_PROMPT);
  }, [skillPrompt, refreshThrml]);

  const newChat = () => {
    setActiveSkill(null);
    setActivePanel("chat");
    void refreshThrml(DEFAULT_THRML_PROMPT);
  };

  const handleExport = useCallback(async () => {
    const filename = await exportSession();
    if (filename) {
      setToast({
        title: locale === "zh" ? "会话已导出" : "Session exported",
        detail: filename,
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.92, y: 0.92 },
        colors: ["#d4af37", "#b8860b", "#fff4b8"],
      });
    }
  }, [exportSession, locale]);

  const handleExportTeamBundle = useCallback(async () => {
    try {
      setActivePanel("explore");
      const result = await exportBundle();
      if (result) {
        setToast({
          title: locale === "zh" ? "团队包已导出" : "Team bundle exported",
          detail: `${result.count} entries → ${result.filename}`,
        });
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { x: 0.88, y: 0.88 },
          colors: ["#38bdf8", "#d4af37", "#fff4b8"],
        });
      }
    } catch (err) {
      setToast({
        title: locale === "zh" ? "导出失败" : "Export failed",
        detail: err instanceof Error ? err.message : "Team bundle export failed",
      });
    }
  }, [exportBundle, locale]);

  const handleImportPick = useCallback(
    async (file: File) => {
      try {
        const peek = await file.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(peek);
        } catch {
          throw new Error(
            locale === "zh" ? "无效的 JSON 文件" : "Invalid JSON file",
          );
        }

        if (validateTeamBundle(parsed)) {
          setActivePanel("explore");
          await stageImport(new File([peek], file.name, { type: file.type }));
          return;
        }

        const result = await importSession(
          new File([peek], file.name, { type: file.type }),
        );
        setLocale(result.locale);
        setActiveSkill(result.activeSkill);
        setActivePanel(result.activePanel);
        setChatReloadKey((k) => k + 1);
        void refreshThrml(
          result.activeSkill
            ? (studioSkills.find((s) => s.id === result.activeSkill)?.prompt ??
                DEFAULT_THRML_PROMPT)
            : DEFAULT_THRML_PROMPT,
        );
        setToast({
          title: locale === "zh" ? "会话已导入" : "Session imported",
          detail: `${result.messageCount} messages`,
        });
      } catch {
        setToast({
          title: locale === "zh" ? "导入失败" : "Import failed",
          detail: locale === "zh" ? "检查 JSON 格式" : "Check JSON format",
        });
      }
    },
    [importSession, locale, refreshThrml, stageImport, studioSkills],
  );

  const handleChatSend = useCallback(
    (message: string) => {
      void refreshThrml(message);
    },
    [refreshThrml],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        void handleExport();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        importInputRef.current?.click();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        void handleExportTeamBundle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleExport, handleExportTeamBundle]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--forge-void)]">
      <GoldParticleCanvas
        className="opacity-40"
        particleCount={60}
        magnetism={0.008}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportPick(file);
          e.target.value = "";
        }}
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
          <RuntimeStatusChip
            engine={runtimeStatus?.engine ?? null}
            size="md"
          />
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
            disabled={isImporting}
            className="border-white/10 bg-white/5 text-white/70"
            onClick={() => importInputRef.current?.click()}
          >
            {isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {locale === "zh" ? "导入" : "Import"}
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

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden p-4 pt-0">
        <ForgeOnboarding
          locale={locale}
          onOpenExplore={() => setActivePanel("explore")}
        />
        <CrewActivityLog locale={locale} />
        <ThrmlSignalBar
          signal={thrmlSignal}
          loading={thrmlLoading}
          error={thrmlError}
          onRetry={retryThrml}
          locale={locale}
          collapsed={
            activePanel === "ledger" ||
            activePanel === "deploy"
          }
        />
        <div className="flex min-h-0 flex-1 gap-4">
          <SkillsRail
            skills={studioSkills}
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
            chatReloadKey={chatReloadKey}
            thrmlSignal={thrmlSignal}
            exploreDiscuss={exploreDiscuss}
            onExploreDiscussConsumed={() => setExploreDiscuss(null)}
            onExploreDiscuss={(mission, seed) => {
              setActivePanel("chat");
              setActiveSkill("cosmos-explore");
              setExploreDiscuss({ mission, seed });
              void refreshThrml(`${mission.prompt}\n\n${seed}`);
            }}
            onSend={handleChatSend}
            onResetChat={newChat}
            onOpenExplore={() => setActivePanel("explore")}
            onBundleImported={(detail) =>
              setToast({
                title: locale === "zh" ? "团队包" : "Team bundle",
                detail,
              })
            }
          />
        </div>
      </div>

      <CommandPalette
        onPanelChange={setActivePanel}
        onNewChat={newChat}
        onToggleLocale={() =>
          setLocale((l) => (l === "en" ? "zh" : "en"))
        }
        onExport={() => void handleExport()}
        onImport={() => importInputRef.current?.click()}
        onExportTeamBundle={() => void handleExportTeamBundle()}
        onImportTeamBundle={() => importInputRef.current?.click()}
        locale={locale}
      />

      <ExportToast
        title={toast?.title ?? null}
        detail={toast?.detail ?? null}
        locale={locale}
        onDismiss={() => setToast(null)}
      />

      <TeamBundleImportPreviewDialog
        open={Boolean(stagedImport)}
        preview={stagedImport?.preview ?? null}
        locale={locale}
        isImporting={isTeamBundleImporting}
        onCancel={cancelStagedImport}
        onConfirm={() =>
          void confirmStagedImport()
            .then((result) => {
              if (!result) return;
              setActivePanel("explore");
              setToast({
                title: locale === "zh" ? "团队包已导入" : "Team bundle imported",
                detail: `${result.imported} imported, ${result.skipped} skipped`,
              });
            })
            .catch((err) =>
              setToast({
                title: locale === "zh" ? "导入失败" : "Import failed",
                detail:
                  err instanceof Error ? err.message : "Team bundle import failed",
              }),
            )
        }
      />
    </div>
  );
}