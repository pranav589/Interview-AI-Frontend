"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProductTileProps {
  variant?: "light" | "dark" | "parchment";
  headline: string;
  tagline: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  children?: React.ReactNode;
  className?: string;
  image?: string;
}

export function ProductTile({
  variant = "light",
  headline,
  tagline,
  primaryCTA,
  secondaryCTA,
  children,
  className,
  image,
}: ProductTileProps) {
  const bgColor = {
    light: "bg-canvas text-ink",
    dark: "bg-surface-tile-1 text-body-on-dark",
    parchment: "bg-canvas-parchment text-ink",
  }[variant];

  const secondaryBtnVariant = variant === "dark" ? "ghost" : "link"; // Adjusted for on-dark visibility

  return (
    <section
      className={cn(
        "relative w-full flex flex-col items-center text-center overflow-hidden py-20 px-6",
        bgColor,
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-y-4 z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-display-lg font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          {headline}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lead font-normal max-w-2xl"
        >
          {tagline}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-x-6 mt-4"
        >
          {primaryCTA && (
            <Button variant="default" className="rounded-pill px-6 h-11 text-body">
              {primaryCTA.label}
            </Button>
          )}
          {secondaryCTA && (
            <Button 
              variant="link" 
              className={cn(
                "text-primary text-body hover:no-underline px-0",
                variant === "dark" && "text-primary-on-dark"
              )}
            >
              {secondaryCTA.label} &gt;
            </Button>
          )}
        </motion.div>
      </div>

      {image && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-12 w-full max-w-5xl px-4"
        >
          <img 
            src={image} 
            alt={headline} 
            className="w-full h-auto object-cover rounded-none shadow-product" 
          />
        </motion.div>
      )}

      {children}
    </section>
  );
}
