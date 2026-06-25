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
import {
  buildBundleImportPreview,
  compareTeamBundles,
  fetchLedgerEntryMap,
  readTeamBundleFile,
  suggestCompareImportSide,
  type BundleCrewCompareRow,
  type BundleCrewConflictRow,
  type BundleImportPreview,
  type BundleMemoryCompareRow,
  type BundleMemoryConflictRow,
  type TeamBundleCompare,
} from "@/lib/team-bundle";
import type { Locale, TeamBundle } from "@/types/forge";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, FileJson, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const COPY = {
  en: {
    title: "Compare team bundles",
    description:
      "Pick two bundle JSON files to see memory and crew log differences.",
    bundleA: "Bundle A",
    bundleB: "Bundle B",
    chooseFile: "Choose file",
    replace: "Replace",
    team: "Team",
    exported: "Exported",
    forge: "Forge",
    entries: "entries",
    explorations: "explorations",
    pinned: "pinned",
    crewLog: "crew log",
    onlyInA: "Only in A",
    onlyInB: "Only in B",
    sharedUnchanged: "Shared — same claim",
    claimChanged: "Shared — claim differs",
    crewOnlyInA: "Crew only in A",
    crewOnlyInB: "Crew only in B",
    crewUnchanged: "Crew shared — same summary",
    crewSummaryChanged: "Crew shared — summary differs",
    noOnlyInA: "No entries unique to bundle A.",
    noOnlyInB: "No entries unique to bundle B.",
    noUnchanged: "No shared entries with identical claims.",
    noClaimChanged: "No shared ids with different claims.",
    noCrewOnlyInA: "No crew events unique to A.",
    noCrewOnlyInB: "No crew events unique to B.",
    noCrewUnchanged: "No shared crew events with identical summaries.",
    noCrewSummaryChanged: "No shared crew ids with different summaries.",
    tabOverview: "Overview",
    tabMemory: "Memory",
    tabCrew: "Crew log",
    close: "Close",
    pickBoth: "Choose both bundles to compare.",
    invalidFile: "Invalid team bundle file.",
    loading: "Reading bundle…",
    importA: "Import A",
    importB: "Import B",
    importNew: (n: number) => (n === 1 ? "1 new vs ledger" : `${n} new vs ledger`),
    importNothingNew: "nothing new vs ledger",
    suggested: "Suggested",
    importHint: "Opens import preview vs your ledger before merge.",
    staging: "Preparing import…",
  },
  zh: {
    title: "对比团队包",
    description: "选择两个团队包 JSON，查看记忆与团队日志差异。",
    bundleA: "包 A",
    bundleB: "包 B",
    chooseFile: "选择文件",
    replace: "更换",
    team: "团队",
    exported: "导出时间",
    forge: "熔炉",
    entries: "条",
    explorations: "探索",
    pinned: "固定",
    crewLog: "团队日志",
    onlyInA: "仅在 A",
    onlyInB: "仅在 B",
    sharedUnchanged: "共有——主张相同",
    claimChanged: "共有——主张不同",
    crewOnlyInA: "日志仅在 A",
    crewOnlyInB: "日志仅在 B",
    crewUnchanged: "日志共有——摘要相同",
    crewSummaryChanged: "日志共有——摘要不同",
    noOnlyInA: "包 A 无独有条目。",
    noOnlyInB: "包 B 无独有条目。",
    noUnchanged: "无主张相同的共有条目。",
    noClaimChanged: "无主张不同的共有 id。",
    noCrewOnlyInA: "A 无独有日志。",
    noCrewOnlyInB: "B 无独有日志。",
    noCrewUnchanged: "无摘要相同的共有日志。",
    noCrewSummaryChanged: "无摘要不同的共有日志 id。",
    tabOverview: "概览",
    tabMemory: "记忆",
    tabCrew: "团队日志",
    close: "关闭",
    pickBoth: "请选择两个团队包进行对比。",
    invalidFile: "无效的团队包文件。",
    loading: "读取中…",
    importA: "导入 A",
    importB: "导入 B",
    importNew: (n: number) => `账本新增 ${n} 条`,
    importNothingNew: "账本无新增",
    suggested: "推荐",
    importHint: "将打开与账本的导入预览后再合并。",
    staging: "准备导入…",
  },
} as const;

type CompareTab = "overview" | "memory" | "crew";

type TeamBundleCompareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  onImportPick?: (bundle: TeamBundle, side: "A" | "B") => void | Promise<void>;
  stagingImport?: boolean;
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

export function TeamBundleCompareDialog({
  open,
  onOpenChange,
  locale,
  onImportPick,
  stagingImport = false,
}: TeamBundleCompareDialogProps) {
  const t = COPY[locale];
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);
  const [bundleA, setBundleA] = useState<TeamBundle | null>(null);
  const [bundleB, setBundleB] = useState<TeamBundle | null>(null);
  const [compare, setCompare] = useState<TeamBundleCompare | null>(null);
  const [tab, setTab] = useState<CompareTab>("overview");
  const [loadingSide, setLoadingSide] = useState<"A" | "B" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewA, setPreviewA] = useState<BundleImportPreview | null>(null);
  const [previewB, setPreviewB] = useState<BundleImportPreview | null>(null);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTab("overview");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (bundleA && bundleB) {
      setCompare(compareTeamBundles(bundleA, bundleB));
    } else {
      setCompare(null);
      setPreviewA(null);
      setPreviewB(null);
    }
  }, [bundleA, bundleB]);

  useEffect(() => {
    if (!bundleA || !bundleB) return;

    let cancelled = false;
    setLoadingPreviews(true);

    void fetchLedgerEntryMap()
      .then((map) => {
        if (cancelled) return;
        setPreviewA(buildBundleImportPreview(bundleA, map));
        setPreviewB(buildBundleImportPreview(bundleB, map));
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewA(null);
          setPreviewB(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPreviews(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bundleA, bundleB]);

  const reset = () => {
    setBundleA(null);
    setBundleB(null);
    setCompare(null);
    setTab("overview");
    setError(null);
    setLoadingSide(null);
    setPreviewA(null);
    setPreviewB(null);
    setLoadingPreviews(false);
  };

  const suggested =
    compare && bundleA && bundleB
      ? suggestCompareImportSide(compare, bundleA, bundleB, previewA, previewB)
      : null;

  const handleImport = (side: "A" | "B") => {
    const bundle = side === "A" ? bundleA : bundleB;
    if (!bundle || !onImportPick) return;
    void onImportPick(bundle, side);
  };

  const handleFile = async (side: "A" | "B", file: File) => {
    setLoadingSide(side);
    setError(null);
    try {
      const bundle = await readTeamBundleFile(file);
      if (side === "A") setBundleA(bundle);
      else setBundleB(bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.invalidFile);
    } finally {
      setLoadingSide(null);
    }
  };

  const hasCrew =
    (compare?.sideA.stats.crewLog ?? 0) > 0 ||
    (compare?.sideB.stats.crewLog ?? 0) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-h-[min(90vh,720px)] border-white/10 bg-[#0d0d12] text-white sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-[var(--forge-gold)]">{t.title}</DialogTitle>
          <DialogDescription className="text-white/45">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <BundleSlot
            label={t.bundleA}
            bundle={bundleA}
            loading={loadingSide === "A"}
            locale={locale}
            chooseLabel={t.chooseFile}
            replaceLabel={t.replace}
            onChoose={() => inputARef.current?.click()}
            onClear={() => setBundleA(null)}
          />
          <BundleSlot
            label={t.bundleB}
            bundle={bundleB}
            loading={loadingSide === "B"}
            locale={locale}
            chooseLabel={t.chooseFile}
            replaceLabel={t.replace}
            onChoose={() => inputBRef.current?.click()}
            onClear={() => setBundleB(null)}
          />
        </div>

        <input
          ref={inputARef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile("A", file);
            e.target.value = "";
          }}
        />
        <input
          ref={inputBRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile("B", file);
            e.target.value = "";
          }}
        />

        {error && <p className="text-xs text-rose-300/85">{error}</p>}

        {!compare ? (
          <p className="text-xs text-white/35">{t.pickBoth}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {compare.stats.onlyInA > 0 && (
                <StatPill tone="sky">
                  {compare.stats.onlyInA} {t.onlyInA}
                </StatPill>
              )}
              {compare.stats.onlyInB > 0 && (
                <StatPill tone="violet">
                  {compare.stats.onlyInB} {t.onlyInB}
                </StatPill>
              )}
              {compare.stats.sharedUnchanged > 0 && (
                <StatPill tone="muted">
                  {compare.stats.sharedUnchanged} {t.sharedUnchanged}
                </StatPill>
              )}
              {compare.stats.claimChanged > 0 && (
                <StatPill tone="amber">
                  {compare.stats.claimChanged} {t.claimChanged}
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
                active={tab === "memory"}
                onClick={() => setTab("memory")}
              >
                <ArrowLeftRight className="size-3" />
                {t.tabMemory}
              </TabButton>
              {hasCrew && (
                <TabButton
                  active={tab === "crew"}
                  onClick={() => setTab("crew")}
                >
                  {t.tabCrew}
                </TabButton>
              )}
            </div>

            {tab === "overview" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <OverviewCard
                  label={t.bundleA}
                  side={compare.sideA}
                  locale={locale}
                  copy={t}
                  suggested={suggested === "A"}
                  suggestedLabel={t.suggested}
                  ledgerNewLabel={
                    previewA
                      ? previewA.stats.new > 0
                        ? t.importNew(previewA.stats.new)
                        : t.importNothingNew
                      : undefined
                  }
                />
                <OverviewCard
                  label={t.bundleB}
                  side={compare.sideB}
                  locale={locale}
                  copy={t}
                  suggested={suggested === "B"}
                  suggestedLabel={t.suggested}
                  ledgerNewLabel={
                    previewB
                      ? previewB.stats.new > 0
                        ? t.importNew(previewB.stats.new)
                        : t.importNothingNew
                      : undefined
                  }
                />
              </div>
            ) : tab === "memory" ? (
              <ScrollArea className="max-h-[min(50vh,360px)] rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="space-y-4 p-3">
                  <MemorySection
                    title={t.onlyInA}
                    empty={t.noOnlyInA}
                    rows={compare.memory.onlyInA}
                    variant="a"
                  />
                  <MemorySection
                    title={t.onlyInB}
                    empty={t.noOnlyInB}
                    rows={compare.memory.onlyInB}
                    variant="b"
                  />
                  <MemorySection
                    title={t.sharedUnchanged}
                    empty={t.noUnchanged}
                    rows={compare.memory.unchanged}
                    variant="unchanged"
                  />
                  <ConflictSection
                    title={t.claimChanged}
                    empty={t.noClaimChanged}
                    rows={compare.memory.claimChanged}
                    labelA={t.bundleA}
                    labelB={t.bundleB}
                  />
                </div>
              </ScrollArea>
            ) : compare.crew ? (
              <ScrollArea className="max-h-[min(50vh,360px)] rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="space-y-4 p-3">
                  <CrewSection
                    title={t.crewOnlyInA}
                    empty={t.noCrewOnlyInA}
                    rows={compare.crew.onlyInA}
                    variant="a"
                  />
                  <CrewSection
                    title={t.crewOnlyInB}
                    empty={t.noCrewOnlyInB}
                    rows={compare.crew.onlyInB}
                    variant="b"
                  />
                  <CrewSection
                    title={t.crewUnchanged}
                    empty={t.noCrewUnchanged}
                    rows={compare.crew.unchanged}
                    variant="unchanged"
                  />
                  <CrewConflictSection
                    title={t.crewSummaryChanged}
                    empty={t.noCrewSummaryChanged}
                    rows={compare.crew.summaryChanged}
                    labelA={t.bundleA}
                    labelB={t.bundleB}
                  />
                </div>
              </ScrollArea>
            ) : null}
          </>
        )}

        <DialogFooter className="flex-col gap-2 border-white/5 bg-transparent sm:flex-row sm:justify-end">
          {compare && onImportPick && (
            <p className="w-full text-[10px] text-white/30 sm:mr-auto sm:w-auto">
              {loadingPreviews ? t.staging : t.importHint}
            </p>
          )}
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <Button
              variant="outline"
              disabled={stagingImport}
              className="border-white/10 bg-white/5 text-white/70"
              onClick={() => onOpenChange(false)}
            >
              {t.close}
            </Button>
            {compare && onImportPick && bundleA && (
              <Button
                disabled={stagingImport || loadingPreviews}
                className={cn(
                  "bg-sky-500 text-white hover:bg-sky-400",
                  suggested === "A" &&
                    "ring-1 ring-sky-300/50 shadow-[0_0_16px_rgba(56,189,248,0.2)]",
                )}
                onClick={() => handleImport("A")}
              >
                {stagingImport ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t.importA
                )}
                {!loadingPreviews && previewA && (
                  <span className="ml-1 text-[10px] opacity-80">
                    ·{" "}
                    {previewA.stats.new > 0
                      ? t.importNew(previewA.stats.new)
                      : t.importNothingNew}
                  </span>
                )}
              </Button>
            )}
            {compare && onImportPick && bundleB && (
              <Button
                disabled={stagingImport || loadingPreviews}
                className={cn(
                  "bg-violet-500 text-white hover:bg-violet-400",
                  suggested === "B" &&
                    "ring-1 ring-violet-300/50 shadow-[0_0_16px_rgba(167,139,250,0.2)]",
                )}
                onClick={() => handleImport("B")}
              >
                {stagingImport ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t.importB
                )}
                {!loadingPreviews && previewB && (
                  <span className="ml-1 text-[10px] opacity-80">
                    ·{" "}
                    {previewB.stats.new > 0
                      ? t.importNew(previewB.stats.new)
                      : t.importNothingNew}
                  </span>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BundleSlot({
  label,
  bundle,
  loading,
  locale,
  chooseLabel,
  replaceLabel,
  onChoose,
  onClear,
}: {
  label: string;
  bundle: TeamBundle | null;
  loading: boolean;
  locale: Locale;
  chooseLabel: string;
  replaceLabel: string;
  onChoose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {label}
        </p>
        {bundle && (
          <button
            type="button"
            onClick={onClear}
            className="text-white/25 hover:text-white/50"
            aria-label="Clear"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {bundle ? (
        <div className="mt-2 space-y-1 text-[10px] text-white/50">
          <p className="truncate text-sm font-medium text-white/80">
            {bundle.team.label}
          </p>
          <p className="font-mono text-white/35">
            {formatExportedAt(bundle.exportedAt, locale)}
          </p>
          <p>
            {bundle.stats.total} entries · v{bundle.forge.version}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 h-7 rounded-full border-white/10 bg-white/5 text-[10px] text-white/60"
            onClick={onChoose}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <FileJson className="size-3" />
            )}
            {replaceLabel}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 h-8 w-full rounded-lg border-dashed border-white/15 bg-transparent text-[10px] text-white/55"
          onClick={onChoose}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <FileJson className="size-3" />
          )}
          {chooseLabel}
        </Button>
      )}
    </div>
  );
}

function OverviewCard({
  label,
  side,
  locale,
  copy,
  suggested = false,
  suggestedLabel,
  ledgerNewLabel,
}: {
  label: string;
  side: TeamBundleCompare["sideA"];
  locale: Locale;
  copy: {
    exported: string;
    forge: string;
    entries: string;
    explorations: string;
    pinned: string;
    crewLog: string;
  };
  suggested?: boolean;
  suggestedLabel?: string;
  ledgerNewLabel?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-black/20 p-3 text-xs",
        suggested
          ? "border-emerald-400/25 shadow-[0_0_20px_rgba(52,211,153,0.06)]"
          : "border-white/8",
      )}
    >
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
          {label}
        </p>
        {suggested && suggestedLabel && (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-emerald-200/90">
            {suggestedLabel}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium text-white/85">{side.team}</p>
      <dl className="mt-2 space-y-1 text-white/45">
        <div>
          <dt className="inline">{copy.exported}: </dt>
          <dd className="inline font-mono text-white/60">
            {formatExportedAt(side.exportedAt, locale)}
          </dd>
        </div>
        <div>
          <dt className="inline">{copy.forge}: </dt>
          <dd className="inline font-mono text-white/60">v{side.forgeVersion}</dd>
        </div>
        <div>
          {side.stats.total} {copy.entries} · {side.stats.explorations}{" "}
          {copy.explorations} · {side.stats.pinned} {copy.pinned}
        </div>
        {side.stats.crewLog > 0 && (
          <div>
            {side.stats.crewLog} {copy.crewLog}
          </div>
        )}
        {ledgerNewLabel && (
          <div className="text-sky-300/70">{ledgerNewLabel}</div>
        )}
      </dl>
    </div>
  );
}

function MemorySection({
  title,
  empty,
  rows,
  variant,
}: {
  title: string;
  empty: string;
  rows: BundleMemoryCompareRow[];
  variant: "a" | "b" | "unchanged";
}) {
  if (!rows.length) {
    return (
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-white/25">{empty}</p>
      </div>
    );
  }

  const tones = {
    a: "border-sky-400/20 bg-sky-500/[0.06]",
    b: "border-violet-400/20 bg-violet-500/[0.06]",
    unchanged: "border-white/8 bg-black/25",
  };

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {title} ({rows.length})
      </h3>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn("rounded-lg border px-2.5 py-2", tones[variant])}
          >
            <p className="font-mono text-[9px] text-white/30">{row.id}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/70">
              {row.entry.claim}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConflictSection({
  title,
  empty,
  rows,
  labelA,
  labelB,
}: {
  title: string;
  empty: string;
  rows: BundleMemoryConflictRow[];
  labelA: string;
  labelB: string;
}) {
  if (!rows.length) {
    return (
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-white/25">{empty}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">
        {title} ({rows.length})
      </h3>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-amber-400/20 bg-amber-500/[0.05] px-2.5 py-2"
          >
            <p className="font-mono text-[9px] text-white/30">{row.id}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <DiffColumn label={labelA} text={row.entryA.claim} tone="a" />
              <DiffColumn label={labelB} text={row.entryB.claim} tone="b" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrewSection({
  title,
  empty,
  rows,
  variant,
}: {
  title: string;
  empty: string;
  rows: BundleCrewCompareRow[];
  variant: "a" | "b" | "unchanged";
}) {
  if (!rows.length) {
    return (
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-white/25">{empty}</p>
      </div>
    );
  }

  const tones = {
    a: "border-sky-400/20 bg-sky-500/[0.06]",
    b: "border-violet-400/20 bg-violet-500/[0.06]",
    unchanged: "border-white/8 bg-black/25",
  };

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {title} ({rows.length})
      </h3>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn("rounded-lg border px-2.5 py-2", tones[variant])}
          >
            <p className="font-mono text-[9px] text-white/30">
              {row.id} · {row.activity.kind}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/70">
              {row.activity.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrewConflictSection({
  title,
  empty,
  rows,
  labelA,
  labelB,
}: {
  title: string;
  empty: string;
  rows: BundleCrewConflictRow[];
  labelA: string;
  labelB: string;
}) {
  if (!rows.length) {
    return (
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">
          {title}
        </h3>
        <p className="mt-1 text-[10px] text-white/25">{empty}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">
        {title} ({rows.length})
      </h3>
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-lg border border-amber-400/20 bg-amber-500/[0.05] px-2.5 py-2"
          >
            <p className="font-mono text-[9px] text-white/30">
              {row.id} · {row.activityA.kind}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <DiffColumn label={labelA} text={row.activityA.summary} tone="a" />
              <DiffColumn label={labelB} text={row.activityB.summary} tone="b" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DiffColumn({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone: "a" | "b";
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-2 py-1.5",
        tone === "a"
          ? "border-sky-400/15 bg-sky-500/[0.05]"
          : "border-violet-400/15 bg-violet-500/[0.05]",
      )}
    >
      <p className="text-[8px] font-semibold uppercase tracking-wider text-white/35">
        {label}
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-white/65">{text}</p>
    </div>
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

function StatPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "sky" | "muted" | "violet" | "amber";
}) {
  const tones = {
    sky: "border-sky-400/25 bg-sky-500/10 text-sky-200/80",
    muted: "border-white/10 bg-white/5 text-white/45",
    violet: "border-violet-400/25 bg-violet-500/10 text-violet-200/80",
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