"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function FadeInWhenVisible({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleInWhenVisible({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

export function HoverCardWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="px-2 h-full"
    >
      {children}
    </motion.div>
  );
}
