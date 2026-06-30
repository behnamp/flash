"use client";

// components/Tappable.tsx
// Flash — wraps any tappable element (shutter button, mode card, nav item)
// with spring-based press feedback. Satisfies the touch-target press-feedback
// and interruptible-animation rules: every tap state is a spring, so a quick
// double-tap or a tap-then-drag never feels like it's fighting the animation.
//
// Usage:
//   <Tappable onTap={capturePhoto} aria-label="Take photo">
//     <ShutterIcon />
//   </Tappable>

import { motion, type HTMLMotionProps } from "motion/react";
import { tapFeedback } from "@/lib/motion";

type TappableProps = HTMLMotionProps<"button"> & {
  onTap?: () => void;
};

export function Tappable({ onTap, children, className = "", ...rest }: TappableProps) {
  return (
    <motion.button
      variants={tapFeedback}
      initial="rest"
      whileTap="tap"
      onClick={onTap}
      // 44x44pt minimum touch target — ui-ux-pro-max touch-target-size rule.
      // Visual size can be smaller; padding extends the hit area.
      className={`relative flex min-h-[44px] min-w-[44px] items-center justify-center ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
