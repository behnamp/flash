// lib/motion.ts
// Flash — shared animation variants and timing constants.
// Single source of truth so every component uses the same physics and timing.
//
// Rules encoded here (from ui-ux-pro-max skill):
// - 150–300ms for micro-interactions, ≤400ms for complex transitions
// - ease-out entering, ease-in exiting
// - exit ~60–70% of enter duration
// - stagger 30–50ms per item
// - transform/opacity only — never animate width/height/top/left
// - spring physics preferred over linear easing
// - every animation respects prefers-reduced-motion

import type { Transition, Variants } from "motion/react";

// ── Timing tokens ──────────────────────────────────────────────
export const DURATION = {
  enter: 0.3, // 300ms
  exit: 0.2, // 200ms — ~67% of enter, per exit-faster-than-enter rule
  micro: 0.15, // 150ms — taps, toggles, small state changes
  complex: 0.4, // 400ms ceiling for orchestrated sequences
} as const;

export const STAGGER = {
  tight: 0.03, // 30ms — dense grids, many items
  loose: 0.05, // 50ms — short lists, more drama per item
} as const;

// ── Easing tokens ──────────────────────────────────────────────
// Cubic-bezier equivalents of ease-out / ease-in, plus a spring preset.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const; // entering
export const EASE_IN = [0.7, 0, 0.84, 0] as const; // exiting

export const SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

// ── Reduced motion ──────────────────────────────────────────────
// Pass through useReducedMotionVariants() below rather than reading
// prefers-reduced-motion in every component individually.

/**
 * Returns motion-safe variants. When the user has prefers-reduced-motion
 * enabled, opacity-only fades are substituted for any transform-based motion
 * (scale, y, x) so the cause-effect relationship still reads, just without
 * the physical movement. Never disable animation outright — that removes the
 * "something happened" signal entirely, which fails motion-meaning.
 */
export function reduceVariants(
  variants: Variants,
  reduced: boolean,
): Variants {
  if (!reduced) return variants;

  const stripped: Variants = {};
  for (const key in variants) {
    const v = variants[key];
    if (typeof v === "object" && v !== null && "transition" in v) {
      stripped[key] = { opacity: (v as any).opacity, transition: { duration: 0.15 } };
    } else if (typeof v === "object" && v !== null) {
      stripped[key] = { opacity: (v as any).opacity };
    } else {
      stripped[key] = v;
    }
  }
  return stripped;
}

// ── Reveal sequence variants ────────────────────────────────────
// Used by: CinematicReveal component
// Cause-effect: photo "develops" — blur clears, scale settles, opacity rises.
// This is the signature darkroom-reveal moment.

export const revealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.loose,
      delayChildren: 0.1,
    },
  },
};

export const revealPhoto: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.04,
    filter: "blur(18px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATION.complex,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
    transition: {
      duration: DURATION.exit,
      ease: EASE_IN,
    },
  },
};

// Gold flash/glow that pulses once as the photo settles — the "chemical"
// moment. Pure opacity, GPU-cheap, layered behind the photo via z-index.
export const revealGlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.35, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.3, 1],
      ease: "easeOut",
    },
  },
};

// ── Staggered list entrance variants ────────────────────────────
// Used by: StaggerList component (gallery grids, mode pickers, event lists)

export const listContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.tight,
    },
  },
};

export const listItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.enter,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: DURATION.exit,
      ease: EASE_IN,
    },
  },
};

// Spring variant for elements that benefit from physical bounce
// (e.g. a selected photo mode "popping" into the active state)
export const springPop: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.96, transition: SPRING },
  hover: { scale: 1.02, transition: SPRING },
};

// ── Micro-interaction variants ──────────────────────────────────
// Used by: any tappable element — shutter button, mode selector, nav items

export const tapFeedback: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.94, transition: { duration: DURATION.micro } },
};
