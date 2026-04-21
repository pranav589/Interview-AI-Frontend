"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroContent() {
  return (
    <div className="relative max-w-5xl mx-auto text-center">
      <div 
        className="mb-8 animate-slide-up-fade"
        style={{ animationDelay: "100ms" }}
      >
        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          ✨ Your AI Interview Coach
        </span>
      </div>

      <h1 
        className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-pretty animate-slide-up-fade"
        style={{ animationDelay: "300ms" }}
      >
        Master Your Interviews with{" "}
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI Coaching
        </span>
      </h1>

      <p 
        className="text-lg sm:text-xl text-muted-foreground mb-12 text-balance max-w-2xl mx-auto animate-slide-up-fade"
        style={{ animationDelay: "500ms" }}
      >
        Practice real interviews with our AI interviewer, get instant
        feedback, and build confidence for your next opportunity.
      </p>

      <div 
        className="flex flex-col sm:flex-row gap-4 justify-center mb-20 px-4 animate-slide-up-fade"
        style={{ animationDelay: "700ms" }}
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
      </div>
    </div>
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
      <div className="absolute top-40 right-40 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-hero-pulse" />
      <div className="absolute bottom-40 left-40 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-hero-pulse-delayed" />
    </div>
  );
}
