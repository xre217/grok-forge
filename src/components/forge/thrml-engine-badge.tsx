"use client";

import { formatThrmlEngineLabel, type ThrmlSignal } from "@/lib/thrml-types";
import { cn } from "@/lib/utils";
import { Cpu, Zap } from "lucide-react";

type ThrmlEngineBadgeProps = {
  signal: ThrmlSignal;
  size?: "sm" | "md";
  className?: string;
};

export function ThrmlEngineBadge({
  signal,
  size = "sm",
  className,
}: ThrmlEngineBadgeProps) {
  const label = formatThrmlEngineLabel(signal);
  const isIsing = signal.using_thrml && signal.engine === "thrml-ising";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        isIsing
          ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
          : "border-amber-400/25 bg-amber-500/10 text-amber-200/85",
        className,
      )}
      title={
        isIsing
          ? "THRML Ising sampler (JAX) — live"
          : [signal.engine, signal.reason].filter(Boolean).join(" — ")
      }
    >
      {isIsing ? (
        <Cpu className={size === "sm" ? "size-3" : "size-3.5"} />
      ) : (
        <Zap className={size === "sm" ? "size-3" : "size-3.5"} />
      )}
      {label}
    </span>
  );
}