"use client";

import { ReactNode, useRef } from "react";
import { gsap, useGSAP } from "./gsap-hooks";

export function FadeInWhenVisible({ 
  children, 
  delay = 0,
  direction = "up" 
}: { 
  children: ReactNode; 
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const yOffset = direction === "up" ? 30 : direction === "down" ? -30 : 0;
    const xOffset = direction === "left" ? 30 : direction === "right" ? -30 : 0;

    gsap.from(ref.current, {
      y: yOffset,
      x: xOffset,
      opacity: 0,
      duration: 0.8,
      delay: delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="will-change-[transform,opacity]">
      {children}
    </div>
  );
}

export function ScaleInWhenVisible({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(ref.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.8,
      delay: delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      }
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="will-change-[transform,opacity]">
      {children}
    </div>
  );
}

export function HoverCardWrapper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(ref.current, {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      boxShadow: "0 0px 0px 0px rgba(0,0,0,0)",
      duration: 0.4,
      ease: "power2.inOut",
    });
  };

  return (
    <div 
      ref={ref} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      {children}
    </div>
  );
}

export function ParallaxWrapper({ children, speed = 0.1, className = "" }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(ref.current, {
      y: -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={`h-full ${className}`}>
      {children}
    </div>
  );
}

export function MagneticWrapper({ 
  children, 
  strength = 0.3,
  className = "" 
}: { 
  children: ReactNode; 
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);

    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  return (
    <div 
      ref={ref} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
}

export function RevealText({ 
  text, 
  className = "",
  delay = 0 
}: { 
  text: string; 
  className?: string;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const words = containerRef.current?.querySelectorAll(".word-reveal");
    if (words) {
      gsap.from(words, {
        y: "100%",
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        delay,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] py-1">
          <span className="word-reveal inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </div>
  );
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(ref.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }, { scope: ref });

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] origin-left scale-x-0"
      ref={ref}
    />
  );
}

export function AnimatedConnectionLine() {
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(lineRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.5,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: lineRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      }
    });
  }, { scope: lineRef });

  return (
    <div 
      ref={lineRef}
      className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" 
    />
  );
}
