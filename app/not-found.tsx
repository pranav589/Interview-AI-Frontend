"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative min-h-[calc(100vh-52px)] w-full flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-hero-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#2997ff]/5 rounded-full blur-[80px] animate-hero-pulse-delayed" />
      </div>

      <div className="relative z-10 max-w-[500px] w-full flex flex-col items-center space-y-8">
        
        {/* Animated Icon / Illustration */}
        <div className="relative flex items-center justify-center w-40 h-40">
          {/* Concentric rotating circles */}
          <motion.div 
            className="absolute inset-0 border border-dashed border-primary/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-4 border border-dashed border-[#2997ff]/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-8 border border-primary/40 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Central Pulsing Radar core */}
          <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full"
              animate={{ scale: [1, 2], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <Compass className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Text details */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#7a7a7a] font-semibold dark:text-ink-muted">
              404 — Page Not Found
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[40px] font-semibold tracking-[-0.01em] text-foreground leading-tight"
          >
            Lost in Space
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[17px] text-[#7a7a7a] dark:text-ink-muted max-w-sm leading-normal tracking-tight"
          >
            The route you're trying to reach doesn't exist or has been moved to a new destination.
          </motion.p>
        </div>

        {/* Interactive buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center"
        >
          <Button
            id="notfound-btn-back"
            onClick={() => router.back()}
            variant="outline"
            className="rounded-full border border-border h-11 px-6 text-[15px] font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            id="notfound-btn-home"
            asChild
            className="rounded-full bg-primary text-white hover:bg-primary-focus h-11 px-6 text-[15px] font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
