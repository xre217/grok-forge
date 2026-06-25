"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DOMAIN_META } from "@/lib/explorations";
import type { BundleImportPreview } from "@/lib/team-bundle";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";

const COPY = {
  en: {
    title: "Import team bundle",
    description: "Review missions and entries before merging into your ledger.",
    team: "Team",
    exported: "Exported",
    forge: "Forge",
    new: "new",
    duplicates: "duplicates",
    invalid: "invalid",
    explorations: "explorations",
    pinned: "pinned",
    cancel: "Cancel",
    merge: (n: number) => (n === 1 ? "Merge 1 entry" : `Merge ${n} entries`),
    nothingNew: "Nothing new to merge",
    newBadge: "new",
    dupBadge: "exists",
    invalidBadge: "invalid",
    missionEntries: (n: number) => (n === 1 ? "1 entry" : `${n} entries`),
  },
  zh: {
    title: "导入团队包",
    description: "合并前预览任务与条目。",
    team: "团队",
    exported: "导出时间",
    forge: "熔炉",
    new: "新增",
    duplicates: "已存在",
    invalid: "无效",
    explorations: "探索",
    pinned: "固定",
    cancel: "取消",
    merge: (n: number) => `合并 ${n} 条`,
    nothingNew: "没有新条目可合并",
    newBadge: "新增",
    dupBadge: "已有",
    invalidBadge: "无效",
    missionEntries: (n: number) => `${n} 条`,
  },
} as const;

type TeamBundleImportPreviewDialogProps = {
  open: boolean;
  preview: BundleImportPreview | null;
  locale: Locale;
  isImporting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function formatExportedAt(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function TeamBundleImportPreviewDialog({
  open,
  preview,
  locale,
  isImporting = false,
  onConfirm,
  onCancel,
}: TeamBundleImportPreviewDialogProps) {
  const t = COPY[locale];
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  if (!preview) return null;

  const canMerge = preview.stats.new > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isImporting) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={!isImporting}
        className="max-h-[min(90vh,640px)] border-white/10 bg-[#0d0d12] text-white sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--forge-gold)]">{t.title}</DialogTitle>
          <DialogDescription className="text-white/45">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/50">
            <span>
              {t.team}: <span className="text-white/80">{preview.team}</span>
            </span>
            <span>
              {t.exported}:{" "}
              <span className="font-mono text-white/70">
                {formatExportedAt(preview.exportedAt, locale)}
              </span>
            </span>
            <span>
              {t.forge}:{" "}
              <span className="font-mono text-white/70">v{preview.forgeVersion}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatPill tone="sky">
              {preview.stats.new} {t.new}
            </StatPill>
            {preview.stats.duplicate > 0 && (
              <StatPill tone="muted">
                {preview.stats.duplicate} {t.duplicates}
              </StatPill>
            )}
            {preview.stats.invalid > 0 && (
              <StatPill tone="rose">
                {preview.stats.invalid} {t.invalid}
              </StatPill>
            )}
            <StatPill tone="violet">
              {preview.stats.explorations} {t.explorations}
            </StatPill>
            {preview.stats.pinned > 0 && (
              <StatPill tone="gold">
                {preview.stats.pinned} {t.pinned}
              </StatPill>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[min(50vh,320px)] rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="space-y-1 p-2">
            {preview.missions.map((mission) => {
              const meta = DOMAIN_META[mission.domain as keyof typeof DOMAIN_META];
              const expanded = expandedMission === mission.missionId;
              const title = locale === "zh" ? mission.titleZh : mission.title;

              return (
                <div
                  key={mission.missionId}
                  className="overflow-hidden rounded-lg border border-white/5"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMission(expanded ? null : mission.missionId)
                    }
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {meta && (
                          <span
                            className={cn(
                              "shrink-0 rounded-full bg-gradient-to-r px-2 py-0.5 text-[9px] font-medium text-white/90",
                              meta.color,
                            )}
                          >
                            {locale === "zh" ? meta.zh : meta.en}
                          </span>
                        )}
                        <span className="truncate text-sm font-medium text-white/85">
                          {title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-white/35">
                        {t.missionEntries(mission.entries.length)}
                        {mission.newCount > 0 && (
                          <span className="text-sky-300/70">
                            {" "}
                            · {mission.newCount} {t.new}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-white/30 transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  </button>

                  {expanded && (
                    <ul className="space-y-1 border-t border-white/5 px-2 py-2">
                      {mission.entries.map((entry) => (
                        <li
                          key={entry.id}
                          className="rounded-md bg-black/20 px-2 py-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <StatusBadge status={entry.status} locale={locale} />
                            <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-white/65">
                              {entry.claim}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="border-white/5 bg-transparent sm:justify-end">
          <Button
            variant="outline"
            disabled={isImporting}
            className="border-white/10 bg-white/5 text-white/70"
            onClick={onCancel}
          >
            {t.cancel}
          </Button>
          <Button
            disabled={!canMerge || isImporting}
            className="bg-sky-500 text-white hover:bg-sky-400"
            onClick={onConfirm}
          >
            {isImporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : canMerge ? (
              t.merge(preview.stats.new)
            ) : (
              t.nothingNew
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "muted" | "rose" | "violet" | "gold";
}) {
  const tones = {
    sky: "border-sky-400/25 bg-sky-500/10 text-sky-200/80",
    muted: "border-white/10 bg-white/5 text-white/45",
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-200/80",
    violet: "border-violet-400/25 bg-violet-500/10 text-violet-200/80",
    gold: "border-[var(--forge-gold)]/25 bg-[var(--forge-gold)]/10 text-[var(--forge-gold)]",
  };

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({
  status,
  locale,
}: {
  status: "new" | "duplicate" | "invalid";
  locale: Locale;
}) {
  const t = COPY[locale];
  const styles = {
    new: "border-sky-400/30 bg-sky-500/15 text-sky-200",
    duplicate: "border-white/15 bg-white/5 text-white/40",
    invalid: "border-rose-400/30 bg-rose-500/15 text-rose-200",
  };
  const labels = {
    new: t.newBadge,
    duplicate: t.dupBadge,
    invalid: t.invalidBadge,
  };

  return (
    <span
      className={cn(
        "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}