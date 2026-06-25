"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { ROUTES } from "@/lib/constants";
import type { StudioPanel } from "@/types/forge";
import {
  BookOpen,
  Download,
  Languages,
  MessageSquare,
  Rocket,
  Sparkles,
  Telescope,
  Terminal,
  Upload,
  Users,
} from "lucide-react";
import type { Locale } from "@/types/forge";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import confetti from "canvas-confetti";

type CommandPaletteProps = {
  onPanelChange?: (panel: StudioPanel) => void;
  onNewChat?: () => void;
  onToggleLocale?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onExportTeamBundle?: () => void;
  onImportTeamBundle?: () => void;
  locale?: Locale;
};

export function CommandPalette({
  onPanelChange,
  onNewChat,
  onToggleLocale,
  onExport,
  onImport,
  onExportTeamBundle,
  onImportTeamBundle,
  locale = "en",
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands…" />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>
        <CommandGroup heading="Studio">
          <CommandItem onSelect={() => run(() => onNewChat?.())}>
            <MessageSquare />
            New conversation
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => onPanelChange?.("chat"))}
          >
            <Terminal />
            Focus chat
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => onPanelChange?.("skills"))}
          >
            <Sparkles />
            Open skills rail
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => onPanelChange?.("ledger"))}
          >
            <BookOpen />
            View ledger
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => onPanelChange?.("explore"))}
          >
            <Telescope />
            {locale === "zh" ? "探索宇宙" : "Explore cosmos"}
          </CommandItem>
          <CommandItem onSelect={() => run(() => onExport?.())}>
            <Download />
            {locale === "zh" ? "导出会话" : "Export session"}
            <CommandShortcut>⌘⇧E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(() => onImport?.())}>
            <Upload />
            {locale === "zh" ? "导入会话/团队包" : "Import session / bundle"}
            <CommandShortcut>⌘⇧I</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              run(() => onPanelChange?.("explore"));
              onExportTeamBundle?.();
            }}
          >
            <Users />
            {locale === "zh" ? "导出团队包" : "Export team bundle"}
            <CommandShortcut>⌘⇧B</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              run(() => onPanelChange?.("explore"));
              onImportTeamBundle?.();
            }}
          >
            <Upload />
            {locale === "zh" ? "导入团队包" : "Import team bundle"}
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Forge">
          <CommandItem onSelect={() => run(() => router.push(ROUTES.home))}>
            <Rocket />
            Back to landing
          </CommandItem>
          <CommandItem onSelect={() => run(() => onToggleLocale?.())}>
            <Languages />
            Toggle language (EN / 中文)
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() =>
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 },
                  colors: ["#d4af37", "#b8860b", "#fff4b8"],
                }),
              )
            }
          >
            <Sparkles />
            Celebrate
            <CommandShortcut>🎉</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}