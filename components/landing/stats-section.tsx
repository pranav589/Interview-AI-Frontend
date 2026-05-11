import React from "react";
import { ScaleInWhenVisible } from "./animated-sections";

export function StatsSection() {
  const stats = [
    { label: "Mock Interviews", value: "50k+" },
    { label: "Success Rate", value: "94%" },
    { label: "AI Accuracy", value: "99.2%" },
    { label: "User Rating", value: "4.9/5" },
  ];

  return (
    <section className="py-24 border-y border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <ScaleInWhenVisible key={i} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </ScaleInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}
