"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  clearCrewActivities,
  CREW_ACTIVITY_MAX,
  type CrewActivity,
} from "@/lib/crew-activity";
import {
  applyCrewLogImport,
  exportAndDownloadCrewLog,
  readCrewLogFile,
} from "@/lib/crew-log-bundle";
import { useCrewActivity } from "@/hooks/use-crew-activity";
import type { CrewActivityKind, Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Download,
  History,
  Loader2,
  Search,
  Telescope,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

type CrewLogFilter = "all" | CrewActivityKind | "bundle" | "session";

const COPY = {
  en: {
    title: "Crew log",
    subtitle: "Pins, explorations, and bundle/session I/O on this machine.",
    search: "Search events…",
    clear: "Clear log",
    empty: "No crew events yet. Pin a reply, log an exploration, or import a bundle.",
    emptyFilter: "No events match this filter.",
    showing: (n: number, total: number) =>
      total === n ? `${n} events` : `${n} of ${total} events`,
    filters: {
      all: "All",
      pin: "Pins",
      explore: "Explore",
      bundle: "Bundles",
      session: "Sessions",
      "bundle-export": "Bundle export",
      "bundle-import": "Bundle import",
      "session-export": "Session export",
      "session-import": "Session import",
      "crew-log-export": "Crew log export",
      "crew-log-import": "Crew log import",
    },
    kinds: {
      pin: "Pinned",
      explore: "Explore",
      "bundle-export": "Bundle export",
      "bundle-import": "Bundle import",
      "session-export": "Session export",
      "session-import": "Session import",
      "crew-log-export": "Crew log export",
      "crew-log-import": "Crew log import",
    },
    justNow: "just now",
    minutesAgo: (n: number) => (n === 1 ? "1m ago" : `${n}m ago`),
    hoursAgo: (n: number) => (n === 1 ? "1h ago" : `${n}h ago`),
    daysAgo: (n: number) => (n === 1 ? "1d ago" : `${n}d ago`),
    exportLog: "Export log",
    importLog: "Import log",
    exported: (n: number) => `${n} events exported`,
    imported: (merged: number, skipped: number) =>
      `${merged} merged, ${skipped} skipped`,
    exportFailed: "Crew log export failed",
    importFailed: "Crew log import failed",
    exportFiltered: "Exporting filtered view",
  },
  zh: {
    title: "团队日志",
    subtitle: "本机上的固定、探索与团队包/会话操作记录。",
    search: "搜索事件…",
    clear: "清除日志",
    empty: "暂无团队事件。固定回复、记录探索或导入团队包后会出现在此。",
    emptyFilter: "没有符合筛选的事件。",
    showing: (n: number, total: number) =>
      total === n ? `${n} 条` : `${n} / ${total} 条`,
    filters: {
      all: "全部",
      pin: "固定",
      explore: "探索",
      bundle: "团队包",
      session: "会话",
      "bundle-export": "导出团队包",
      "bundle-import": "导入团队包",
      "session-export": "导出会话",
      "session-import": "导入会话",
      "crew-log-export": "导出团队日志",
      "crew-log-import": "导入团队日志",
    },
    kinds: {
      pin: "已固定",
      explore: "探索",
      "bundle-export": "导出团队包",
      "bundle-import": "导入团队包",
      "session-export": "导出会话",
      "session-import": "导入会话",
      "crew-log-export": "导出团队日志",
      "crew-log-import": "导入团队日志",
    },
    justNow: "刚刚",
    minutesAgo: (n: number) => `${n} 分钟前`,
    hoursAgo: (n: number) => `${n} 小时前`,
    daysAgo: (n: number) => `${n} 天前`,
    exportLog: "导出日志",
    importLog: "导入日志",
    exported: (n: number) => `已导出 ${n} 条`,
    imported: (merged: number, skipped: number) =>
      `合并 ${merged} 条，跳过 ${skipped} 条`,
    exportFailed: "团队日志导出失败",
    importFailed: "团队日志导入失败",
    exportFiltered: "导出当前筛选结果",
  },
} as const;

const FILTER_CHIPS: CrewLogFilter[] = [
  "all",
  "pin",
  "explore",
  "bundle",
  "session",
];

function formatRelativeTime(iso: string, locale: Locale): string {
  const t = COPY[locale];
  const delta = Date.now() - new Date(iso).getTime();
  if (delta < 60_000) return t.justNow;
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 60) return t.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  return t.daysAgo(days);
}

function ActivityIcon({ kind }: { kind: CrewActivity["kind"] }) {
  const className = "size-3.5 shrink-0";
  switch (kind) {
    case "pin":
      return <Bookmark className={cn(className, "text-[var(--forge-gold)]")} />;
    case "explore":
      return <Telescope className={cn(className, "text-sky-300")} />;
    case "bundle-export":
    case "session-export":
      return <Download className={cn(className, "text-emerald-300")} />;
    case "bundle-import":
    case "session-import":
    case "crew-log-import":
      return <Upload className={cn(className, "text-violet-300")} />;
    case "crew-log-export":
      return <History className={cn(className, "text-violet-200")} />;
  }
}

function matchesFilter(activity: CrewActivity, filter: CrewLogFilter): boolean {
  if (filter === "all") return true;
  if (filter === "bundle") {
    return activity.kind === "bundle-export" || activity.kind === "bundle-import";
  }
  if (filter === "session") {
    return (
      activity.kind === "session-export" || activity.kind === "session-import"
    );
  }
  return activity.kind === filter;
}

function matchesSearch(activity: CrewActivity, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [activity.summary, activity.detail ?? "", activity.kind]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

type CrewLogPanelProps = {
  locale: Locale;
  onExported?: (detail: string) => void;
  onImported?: (detail: string) => void;
};

export function CrewLogPanel({
  locale,
  onExported,
  onImported,
}: CrewLogPanelProps) {
  const t = COPY[locale];
  const importInputRef = useRef<HTMLInputElement>(null);
  const { activities } = useCrewActivity(CREW_ACTIVITY_MAX);
  const [filter, setFilter] = useState<CrewLogFilter>("all");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      activities.filter(
        (a) => matchesFilter(a, filter) && matchesSearch(a, search),
      ),
    [activities, filter, search],
  );

  const exportPartial =
    filter !== "all" || search.trim().length > 0;

  const handleExport = () => {
    setExporting(true);
    setError(null);
    try {
      const entries = exportPartial ? filtered : undefined;
      const result = exportAndDownloadCrewLog(
        locale,
        entries,
        exportPartial
          ? {
              filter,
              search: search.trim(),
              partial: true,
            }
          : undefined,
      );
      const detail = t.exported(result.count);
      setStatus(detail);
      onExported?.(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.exportFailed;
      setError(message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setError(null);
    try {
      const bundle = await readCrewLogFile(file);
      const result = applyCrewLogImport(bundle);
      const detail = t.imported(result.merged, result.skipped);
      setStatus(detail);
      onImported?.(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.importFailed);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="forge-glass flex h-full min-h-0 flex-1 flex-col rounded-2xl">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="size-5 text-violet-300" />
          <div>
            <h2 className="text-lg font-semibold text-[var(--forge-gold)]">
              {t.title}
            </h2>
            <p className="text-xs text-white/45">{t.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setFilter(chip)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                filter === chip
                  ? "border-violet-400/35 bg-violet-500/15 text-violet-100"
                  : "border-white/10 bg-white/[0.02] text-white/40 hover:text-white/60",
              )}
            >
              {t.filters[chip]}
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/25" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-8 text-xs text-white placeholder:text-white/25 focus:border-violet-400/30 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/55"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <p className="mt-2 text-[10px] text-white/30">
          {t.showing(filtered.length, activities.length)}
          {exportPartial && activities.length > 0 && (
            <span className="text-violet-300/60"> · {t.exportFiltered}</span>
          )}
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {filtered.length === 0 ? (
          <p className="p-5 text-sm text-white/35">
            {activities.length === 0 ? t.empty : t.emptyFilter}
          </p>
        ) : (
          <ul className="space-y-1 p-4">
            {filtered.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04]"
              >
                <ActivityIcon kind={activity.kind} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                      {t.kinds[activity.kind]}
                    </span>
                    <span className="font-mono text-[10px] text-white/25">
                      {formatRelativeTime(activity.ts, locale)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-white/75">
                    {activity.summary}
                  </p>
                  {activity.detail && (
                    <p className="mt-1 text-xs leading-relaxed text-white/35">
                      {activity.detail}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[9px] text-white/20">
                    {activity.id}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      {(status || error) && (
        <p
          className={cn(
            "border-t border-white/5 px-4 py-2 text-xs",
            error ? "text-rose-300/85" : "text-violet-200/80",
          )}
        >
          {error ?? status}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-white/5 px-4 py-3">
        <Button
          size="sm"
          variant="outline"
          disabled={exporting || importing || activities.length === 0}
          className="h-7 rounded-full border-white/10 bg-white/5 text-[10px] text-white/60"
          onClick={handleExport}
        >
          {exporting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Download className="size-3" />
          )}
          {t.exportLog}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={exporting || importing}
          className="h-7 rounded-full border-white/10 bg-white/5 text-[10px] text-white/60"
          onClick={() => importInputRef.current?.click()}
        >
          {importing ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Upload className="size-3" />
          )}
          {t.importLog}
        </Button>
        {activities.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            disabled={exporting || importing}
            className="h-7 rounded-full border-white/10 bg-white/5 text-[10px] text-white/50"
            onClick={() => clearCrewActivities()}
          >
            {t.clear}
          </Button>
        )}
      </div>

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImport(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}