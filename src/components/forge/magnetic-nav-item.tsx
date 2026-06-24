"use client";

import { useMagneticTilt } from "@/hooks/use-magnetic-tilt";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export type MagneticNavItemProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  shortcut?: string;
};

export function MagneticNavItem({
  label,
  icon: Icon,
  active,
  onClick,
  shortcut,
}: MagneticNavItemProps) {
  const { ref, style, onMove, onLeave } = useMagneticTilt({
    magnetism: 0.22,
    tilt: 8,
  });

  return (
    <motion.div
      ref={ref}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative"
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          layoutId="forge-nav-pill"
          className="absolute inset-0 rounded-xl border border-[var(--forge-gold)]/25 bg-[var(--forge-gold)]/10 shadow-[0_0_28px_var(--forge-gold-glow),inset_0_1px_0_rgba(255,255,255,0.06)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {active && (
        <motion.div
          layoutId="forge-nav-bar"
          className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-[var(--forge-gold)] to-[var(--forge-gold-dim)] shadow-[0_0_12px_var(--forge-gold-glow)]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}

      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative z-10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
          active
            ? "text-[var(--forge-gold)]"
            : "text-white/50 hover:text-white/80",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all",
            active
              ? "bg-[var(--forge-gold)]/20 text-[var(--forge-gold)] shadow-[0_0_16px_var(--forge-gold-glow)]"
              : "bg-white/[0.03] text-white/40",
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="flex-1 font-medium">{label}</span>
        {shortcut && (
          <kbd className="hidden rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/25 sm:inline">
            {shortcut}
          </kbd>
        )}
      </button>
    </motion.div>
  );
}