"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export function HeroContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative max-w-5xl mx-auto text-center"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          ✨ Your AI Interview Coach
        </span>
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-pretty"
      >
        Master Your Interviews with{" "}
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Coaching
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-lg sm:text-xl text-muted-foreground mb-12 text-balance max-w-2xl mx-auto"
      >
        Practice real interviews with our AI interviewer, get instant
        feedback, and build confidence for your next opportunity.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-20 px-4"
      >
        <Link href="/auth/signup">
          <Button size="lg" className="w-full sm:w-auto gap-2">
            Start Practicing Free
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/auth/signin">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Sign In
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-20 dark:opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, oklch(0.55 0.25 270 / 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 60%, oklch(0.65 0.2 300 / 0.1) 0%, transparent 50%)`,
        }}
      />
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-40 right-40 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-40 left-40 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
      />
    </div>
  );
}
