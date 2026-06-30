"use client";

// components/StaggerList.tsx
// Flash — generic staggered list/grid entrance.
//
// Reusable wherever a set of items should enter in sequence rather than all
// at once: photo mode picker, event list, guest gallery thumbnails, settings
// rows. Renders as a plain <ul> by default; pass `as="div"` for grid layouts
// where a list semantic doesn't fit.
//
// Usage:
//   <StaggerList items={photoModes} getKey={(m) => m.id}>
//     {(mode) => <ModeCard mode={mode} />}
//   </StaggerList>

import { motion, useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { listContainer, listItem, reduceVariants } from "@/lib/motion";

type StaggerListProps<T> = {
  items: T[];
  getKey: (item: T, index: number) => string;
  children: (item: T, index: number) => ReactNode;
  as?: "ul" | "div";
  className?: string;
  itemClassName?: string;
};

export function StaggerList<T>({
  items,
  getKey,
  children,
  as = "ul",
  className = "",
  itemClassName = "",
}: StaggerListProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = useMemo(
    () => reduceVariants(listItem, !!prefersReducedMotion),
    [prefersReducedMotion],
  );

  const Container = as === "ul" ? motion.ul : motion.div;
  const Item = as === "ul" ? motion.li : motion.div;

  return (
    <Container
      variants={listContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <Item
          key={getKey(item, index)}
          variants={itemVariants}
          className={itemClassName}
          style={{ willChange: "transform, opacity" }}
        >
          {children(item, index)}
        </Item>
      ))}
    </Container>
  );
}
