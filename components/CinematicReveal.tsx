"use client";

// components/CinematicReveal.tsx
// Flash — the signature darkroom reveal sequence.
//
// Cause-effect: a photo "develops" out of darkness — blur clears, scale
// settles from a slight zoom, opacity rises, and a single gold glow pulse
// marks the moment it's "ready." This is the emotional peak of the guest
// experience, so it gets the full 400ms complex-transition budget and a
// real spring on entry rather than a flat fade.
//
// Usage:
//   <CinematicReveal
//     photos={revealedPhotos}
//     onPhotoClick={(photo) => openLightbox(photo)}
//   />

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  reduceVariants,
  revealContainer,
  revealGlow,
  revealPhoto,
} from "@/lib/motion";

type RevealPhoto = {
  id: string;
  url: string;
  guestName?: string;
  mode?: string;
};

type CinematicRevealProps = {
  photos: RevealPhoto[];
  onPhotoClick?: (photo: RevealPhoto) => void;
  className?: string;
};

export function CinematicReveal({
  photos,
  onPhotoClick,
  className = "",
}: CinematicRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // Variants are computed once per reduced-motion state change, not per render.
  const photoVariants = useMemo(
    () => reduceVariants(revealPhoto, !!prefersReducedMotion),
    [prefersReducedMotion],
  );
  const glowVariants = useMemo(
    () => reduceVariants(revealGlow, !!prefersReducedMotion),
    [prefersReducedMotion],
  );

  return (
    <motion.div
      variants={revealContainer}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${className}`}
      aria-label="Revealed event photos"
    >
      <AnimatePresence mode="popLayout">
        {photos.map((photo) => (
          <motion.button
            key={photo.id}
            variants={photoVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            onClick={() => onPhotoClick?.(photo)}
            className="
              relative aspect-square overflow-hidden rounded-sm
              bg-[#0A0A0F]
              focus-visible:outline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]
            "
            aria-label={
              photo.guestName
                ? `Photo by ${photo.guestName}`
                : "Event photo"
            }
            style={{
              // GPU-cheap: only transform + filter + opacity animate.
              // willChange hints the browser to promote this layer once,
              // not for the whole component lifetime — removed after settle.
              willChange: "transform, filter, opacity",
            }}
          >
            {/* Gold develop-glow — layered behind the image, pure opacity */}
            <motion.div
              variants={glowVariants}
              initial="hidden"
              animate="visible"
              className="
                pointer-events-none absolute inset-0 z-10
                bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.5)_0%,transparent_70%)]
              "
              aria-hidden="true"
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />

            {photo.guestName && (
              <div
                className="
                  absolute inset-x-0 bottom-0 z-20
                  bg-gradient-to-t from-[#0A0A0F]/90 to-transparent
                  px-2 pb-1.5 pt-4
                "
              >
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#E8E4DC]/80">
                  {photo.guestName}
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
