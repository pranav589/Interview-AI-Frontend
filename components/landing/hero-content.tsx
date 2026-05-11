"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "./gsap-hooks";
import { MagneticWrapper, RevealText } from "./animated-sections";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export function HeroContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(badgeRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })
    .from(textRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    }, "-=0.4")
    .from(buttonsRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    }, "-=0.6");
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto text-center py-20 sm:py-32 z-10">
      <div ref={badgeRef} className="mb-8">
        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 backdrop-blur-sm">
          ✨ Your AI Interview Coach
        </span>
      </div>

      <RevealText 
        text="Master Your Interviews with AI Coaching"
        className="text-hero-display mb-6 text-pretty justify-center"
      />

      <p 
        ref={textRef}
        className="text-lead text-muted-foreground mb-12 text-balance max-w-2xl mx-auto"
      >
        Practice real interviews with our AI interviewer, get instant
        feedback, and build confidence for your next opportunity.
      </p>

      <div 
        ref={buttonsRef}
        className="flex flex-col sm:flex-row gap-4 justify-center px-4"
      >
        <MagneticWrapper strength={0.1}>
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              Start Practicing Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </MagneticWrapper>
        <MagneticWrapper strength={0.15}>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm">
              Sign In
            </Button>
          </Link>
        </MagneticWrapper>
      </div>
    </div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <BackgroundGradientAnimation 
        containerClassName="!h-full !w-full !absolute"
        className="hidden"
      />
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
    </div>
  );
}

