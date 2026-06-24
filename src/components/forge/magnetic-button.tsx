"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Slot } from "radix-ui";
import { type ReactNode, useRef } from "react";

export type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  /** Pull strength toward cursor — 0.2 subtle, 0.5 strong */
  strength?: number;
  asChild?: boolean;
  onClick?: () => void;
};

export function MagneticButton({
  children,
  className,
  strength = 0.32,
  asChild = false,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 280, damping: 22, mass: 0.4 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const inner = asChild ? (
    <Slot.Root className={cn("inline-flex", className)} onClick={onClick}>
      {children}
    </Slot.Root>
  ) : (
    <button
      type="button"
      className={cn("inline-flex", className)}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block"
      whileTap={{ scale: 0.97 }}
    >
      {inner}
    </motion.div>
  );
}