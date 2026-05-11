"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/**
 * Split text into words/letters for animation
 */
export const splitText = (text: string) => {
  return text.split(" ").map((word, i) => ({
    word,
    index: i,
  }));
};

/**
 * Common animation presets
 */
export const animationPresets = {
  fadeInUp: {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  },
  staggeredReveal: {
    y: 20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out",
  },
};
