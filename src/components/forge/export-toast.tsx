"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, FileJson } from "lucide-react";
import { useEffect } from "react";

type ExportToastProps = {
  title: string | null;
  detail: string | null;
  locale: "en" | "zh";
  onDismiss: () => void;
};

export function ExportToast({
  title,
  detail,
  locale,
  onDismiss,
}: ExportToastProps) {
  useEffect(() => {
    if (!title) return;
    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [title, onDismiss]);

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="forge-glass fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_0_40px_var(--forge-gold-glow)]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Check className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{title}</p>
            {detail && (
              <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[10px] text-[var(--forge-gold-dim)]">
                <FileJson className="size-3 shrink-0" />
                {detail}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}