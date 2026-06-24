"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useCallback, useRef } from "react";

type MagneticTiltOptions = {
  /** Cursor pull strength */
  magnetism?: number;
  /** Max 3D tilt in degrees */
  tilt?: number;
};

export function useMagneticTilt({
  magnetism = 0.18,
  tilt = 6,
}: MagneticTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 320, damping: 24, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 320, damping: 24, mass: 0.35 });
  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 22 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      x.set((e.clientX - cx) * magnetism);
      y.set((e.clientY - cy) * magnetism);
      rotateY.set((px - 0.5) * tilt * 2);
      rotateX.set((0.5 - py) * tilt * 2);
    },
    [magnetism, tilt, x, y, rotateX, rotateY],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }, [x, y, rotateX, rotateY]);

  return {
    ref,
    style: {
      x: springX,
      y: springY,
      rotateX: springRotateX,
      rotateY: springRotateY,
      transformStyle: "preserve-3d" as const,
    },
    onMove,
    onLeave,
  };
}