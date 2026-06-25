"use client";

import {
  CHIP_STYLES,
  type EngineSnapshot,
} from "@/lib/engine-status";
import { cn } from "@/lib/utils";

type RuntimeStatusChipProps = {
  engine: EngineSnapshot | null;
  size?: "sm" | "md";
};

export function RuntimeStatusChip({
  engine,
  size = "sm",
}: RuntimeStatusChipProps) {
  if (!engine) {
    return (
      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
        …
      </span>
    );
  }

  return (
    <span
      title={engine.chip.title}
      className={cn(
        "rounded-full border font-medium uppercase tracking-wider",
        CHIP_STYLES[engine.chip.variant],
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
      )}
    >
      {engine.chip.short}
    </span>
  );
}