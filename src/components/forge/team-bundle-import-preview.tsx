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
import type {
  BundleDiffRow,
  BundleImportPreview,
} from "@/lib/team-bundle";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
    changed: "claim changed",
    explorations: "explorations",
    pinned: "pinned",
    cancel: "Cancel",
    merge: (n: number) => (n === 1 ? "Merge 1 entry" : `Merge ${n} entries`),
    nothingNew: "Nothing new to merge",
    newBadge: "new",
    dupBadge: "exists",
    invalidBadge: "invalid",
    missionEntries: (n: number) => (n === 1 ? "1 entry" : `${n} entries`),
    tabOverview: "Missions",
    tabDiff: "Diff vs ledger",
    additions: "Additions",
    additionsHint: "These entries will be appended to your ledger.",
    dupSection: "Already in ledger",
    dupHint: "Same id — skipped on merge. Claim changes are shown below.",
    invalidSection: "Invalid entries",
    yourLedger: "Your ledger",
    incoming: "Incoming bundle",
    unchanged: "Unchanged — skipped",
    claimChanged: "Claim differs",
    noAdditions: "No new entries to add.",
    noDuplicates: "No overlapping ids with your ledger.",
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
    changed: "主张不同",
    explorations: "探索",
    pinned: "固定",
    cancel: "取消",
    merge: (n: number) => `合并 ${n} 条`,
    nothingNew: "没有新条目可合并",
    newBadge: "新增",
    dupBadge: "已有",
    invalidBadge: "无效",
    missionEntries: (n: number) => `${n} 条`,
    tabOverview: "任务",
    tabDiff: "与账本对比",
    additions: "新增条目",
    additionsHint: "合并时将写入账本。",
    dupSection: "账本已有",
    dupHint: "相同 id 将跳过。主张差异如下。",
    invalidSection: "无效条目",
    yourLedger: "你的账本",
    incoming: "导入包",
    unchanged: "未变——跳过",
    claimChanged: "主张不同",
    noAdditions: "无新增条目。",
    noDuplicates: "与账本无重叠 id。",
  },
} as const;

type PreviewTab = "overview" | "diff";

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
  const [tab, setTab] = useState<PreviewTab>("overview");
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !preview) return;
    setTab(
      preview.stats.duplicate > 0 || preview.stats.changed > 0
        ? "diff"
        : "overview",
    );
    setExpandedMission(null);
  }, [open, preview]);

  if (!preview) return null;

  const canMerge = preview.stats.new > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isImporting) {
          setTab("overview");
          setExpandedMission(null);
          onCancel();
        }
      }}
    >
      <DialogContent
        showCloseButton={!isImporting}
        className="max-h-[min(90vh,680px)] border-white/10 bg-[#0d0d12] text-white sm:max-w-xl"
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
            {preview.stats.changed > 0 && (
              <StatPill tone="amber">
                {preview.stats.changed} {t.changed}
              </StatPill>
            )}
            {preview.stats.invalid > 0 && (
              <StatPill tone="rose">
                {preview.stats.invalid} {t.invalid}
              </StatPill>
            )}
          </div>

          <div className="flex gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-0.5">
            <TabButton
              active={tab === "overview"}
              onClick={() => setTab("overview")}
            >
              {t.tabOverview}
            </TabButton>
            <TabButton
              active={tab === "diff"}
              onClick={() => setTab("diff")}
            >
              <ArrowLeftRight className="size-3" />
              {t.tabDiff}
            </TabButton>
          </div>
        </div>

        {tab === "overview" ? (
          <ScrollArea className="max-h-[min(50vh,320px)] rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="space-y-1 p-2">
              {preview.missions.map((mission) => {
                const meta =
                  DOMAIN_META[mission.domain as keyof typeof DOMAIN_META];
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
        ) : (
          <ScrollArea className="max-h-[min(50vh,360px)] rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="space-y-4 p-3">
              <DiffSection
                title={t.additions}
                hint={t.additionsHint}
                empty={t.noAdditions}
                rows={preview.diff.additions}
                locale={locale}
                variant="add"
              />
              <DiffSection
                title={t.dupSection}
                hint={t.dupHint}
                empty={t.noDuplicates}
                rows={preview.diff.duplicates}
                locale={locale}
                variant="dup"
              />
              {preview.diff.invalid.length > 0 && (
                <DiffSection
                  title={t.invalidSection}
                  hint=""
                  empty=""
                  rows={preview.diff.invalid}
                  locale={locale}
                  variant="invalid"
                />
              )}
            </div>
          </ScrollArea>
        )}

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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
        active
          ? "bg-white/10 text-white/85"
          : "text-white/35 hover:text-white/55",
      )}
    >
      {children}
    </button>
  );
}

function DiffSection({
  title,
  hint,
  empty,
  rows,
  locale,
  variant,
}: {
  title: string;
  hint: string;
  empty: string;
  rows: BundleDiffRow[];
  locale: Locale;
  variant: "add" | "dup" | "invalid";
}) {
  const t = COPY[locale];

  if (!rows.length) {
    if (!empty) return null;
    return (
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-white/25">{empty}</p>
      </div>
    );
  }

  return (
    <div>
      <h3
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          variant === "add" && "text-sky-300/70",
          variant === "dup" && "text-white/40",
          variant === "invalid" && "text-rose-300/70",
        )}
      >
        {title} ({rows.length})
      </h3>
      {hint && <p className="mt-0.5 text-[10px] text-white/25">{hint}</p>}
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              "rounded-lg border px-2.5 py-2",
              variant === "add" && "border-sky-400/20 bg-sky-500/[0.06]",
              variant === "dup" && "border-white/8 bg-black/25",
              variant === "invalid" && "border-rose-400/20 bg-rose-500/[0.06]",
            )}
          >
            <p className="font-mono text-[9px] text-white/30">{row.id}</p>
            {variant === "add" && (
              <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                {row.incoming.claim}
              </p>
            )}
            {variant === "dup" && row.existing && (
              <>
                {row.claimChanged ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <DiffColumn
                      label={t.yourLedger}
                      claim={row.existing.claim}
                      tone="ledger"
                    />
                    <DiffColumn
                      label={t.incoming}
                      claim={row.incoming.claim}
                      tone="incoming"
                    />
                    <p className="sm:col-span-2 text-[9px] font-medium uppercase tracking-wider text-amber-300/70">
                      {t.claimChanged}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-[9px] text-white/30">{t.unchanged}</p>
                    <p className="mt-0.5 text-[11px] text-white/55">
                      {row.incoming.claim}
                    </p>
                  </>
                )}
              </>
            )}
            {variant === "invalid" && (
              <p className="mt-1 text-[11px] text-rose-200/70">
                {row.incoming.claim || "—"}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiffColumn({
  label,
  claim,
  tone,
}: {
  label: string;
  claim: string;
  tone: "ledger" | "incoming";
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5",
        tone === "ledger"
          ? "border-white/10 bg-white/[0.03]"
          : "border-sky-400/15 bg-sky-500/[0.05]",
      )}
    >
      <p className="text-[8px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-white/65">{claim}</p>
    </div>
  );
}

function StatPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "muted" | "rose" | "violet" | "gold" | "amber";
}) {
  const tones = {
    sky: "border-sky-400/25 bg-sky-500/10 text-sky-200/80",
    muted: "border-white/10 bg-white/5 text-white/45",
    rose: "border-rose-400/25 bg-rose-500/10 text-rose-200/80",
    violet: "border-violet-400/25 bg-violet-500/10 text-violet-200/80",
    gold: "border-[var(--forge-gold)]/25 bg-[var(--forge-gold)]/10 text-[var(--forge-gold)]",
    amber: "border-amber-400/25 bg-amber-500/10 text-amber-200/80",
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