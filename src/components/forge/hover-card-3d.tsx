"use client";

import { cn } from "@/lib/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { type ReactNode, useRef } from "react";

export type HoverCard3DProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees */
  tilt?: number;
  glare?: boolean;
};

export function HoverCard3D({
  children,
  className,
  tilt = 12,
  glare = true,
}: HoverCard3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 24 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 24 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(212,175,55,0.2) 0%, transparent 55%)`;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * tilt * 2);
    rotateX.set((0.5 - py) * tilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
      className={cn("group relative", className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
      )}
    </motion.div>
  );
}