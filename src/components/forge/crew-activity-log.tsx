"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { clearCrewActivities, type CrewActivity } from "@/lib/crew-activity";
import { useCrewActivity } from "@/hooks/use-crew-activity";
import type { Locale } from "@/types/forge";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  ChevronDown,
  Download,
  History,
  Telescope,
  Upload,
} from "lucide-react";
import { useState } from "react";

const COPY = {
  en: {
    title: "Crew log",
    empty: "Pins, explorations, and bundle events appear here.",
    clear: "Clear",
    justNow: "just now",
    minutesAgo: (n: number) => (n === 1 ? "1m ago" : `${n}m ago`),
    hoursAgo: (n: number) => (n === 1 ? "1h ago" : `${n}h ago`),
    daysAgo: (n: number) => (n === 1 ? "1d ago" : `${n}d ago`),
    kinds: {
      pin: "Pinned",
      explore: "Explore",
      "bundle-export": "Bundle export",
      "bundle-import": "Bundle import",
      "session-export": "Session export",
      "session-import": "Session import",
    },
  },
  zh: {
    title: "团队日志",
    empty: "固定、探索与团队包操作会记录在此。",
    clear: "清除",
    justNow: "刚刚",
    minutesAgo: (n: number) => `${n} 分钟前`,
    hoursAgo: (n: number) => `${n} 小时前`,
    daysAgo: (n: number) => `${n} 天前`,
    kinds: {
      pin: "已固定",
      explore: "探索",
      "bundle-export": "导出团队包",
      "bundle-import": "导入团队包",
      "session-export": "导出会话",
      "session-import": "导入会话",
    },
  },
} as const;

type CrewActivityLogProps = {
  locale: Locale;
  className?: string;
};

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
  const className = "size-3 shrink-0";
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
      return <Upload className={cn(className, "text-violet-300")} />;
  }
}

export function CrewActivityLog({ locale, className }: CrewActivityLogProps) {
  const t = COPY[locale];
  const { activities } = useCrewActivity(16);
  const [expanded, setExpanded] = useState(false);

  const latest = activities[0];

  return (
    <div
      className={cn(
        "forge-glass mb-3 overflow-hidden rounded-xl border border-white/5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.02]"
      >
        <History className="size-3.5 text-white/35" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-white/45">
          {t.title}
        </span>
        {activities.length > 0 && (
          <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-white/35">
            {activities.length}
          </span>
        )}
        {latest && !expanded && (
          <span className="min-w-0 flex-1 truncate text-[10px] text-white/30">
            {formatRelativeTime(latest.ts, locale)} · {latest.summary}
          </span>
        )}
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 shrink-0 text-white/30 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-white/5">
          {activities.length === 0 ? (
            <p className="px-3 py-3 text-[10px] text-white/30">{t.empty}</p>
          ) : (
            <>
              <ScrollArea className="max-h-44">
                <ul className="space-y-0.5 p-2">
                  {activities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.02]"
                    >
                      <ActivityIcon kind={activity.kind} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-white/40">
                            {t.kinds[activity.kind]}
                          </span>
                          <span className="font-mono text-[9px] text-white/25">
                            {formatRelativeTime(activity.ts, locale)}
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug text-white/65">
                          {activity.summary}
                        </p>
                        {activity.detail && (
                          <p className="mt-0.5 text-[10px] text-white/30">
                            {activity.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <div className="flex justify-end border-t border-white/5 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => clearCrewActivities()}
                  className="text-[9px] text-white/25 hover:text-white/50"
                >
                  {t.clear}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}