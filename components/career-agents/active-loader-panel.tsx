import { Sparkles } from "lucide-react";

interface ActiveLoaderPanelProps {
  companyName: string;
  loaderPhase: number;
}

export function ActiveLoaderPanel({ companyName, loaderPhase }: ActiveLoaderPanelProps) {
  return (
    <div className="border rounded-2xl bg-card p-8 shadow-apple-card relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
      
      {/* Radial scanner graphic */}
      <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 border border-primary/20 rounded-full" />
        <div className="absolute inset-2 border border-primary/40 border-dashed rounded-full" />
        <div className="absolute inset-8 border border-primary/10 rounded-full" />
        {/* Rotating scanner beam */}
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" style={{ animationDuration: "3s" }} />
        {/* Glowing central core */}
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Progress details */}
      <div className="text-center max-w-sm mb-8">
        <h3 className="font-extrabold text-lg font-display mb-1 text-ink">Autonomous Engine Researching...</h3>
        <p className="text-xs text-ink-muted leading-relaxed">
          The agent has spawned multiple backend queries to inspect news outlets, tech registries, and cultural databases for {companyName || "the company"}.
        </p>
      </div>

      {/* Steps Progress Tracker */}
      <div className="w-full max-w-md space-y-3 bg-secondary/40 border rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            loaderPhase >= 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {loaderPhase > 0 ? "✓" : "1"}
          </div>
          <span className={`text-xs ${loaderPhase === 0 ? "font-bold text-ink" : "text-ink-muted-80"}`}>
            Initializing Search Routines & Compiling Queries
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            loaderPhase >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {loaderPhase > 1 ? "✓" : "2"}
          </div>
          <span className={`text-xs ${loaderPhase === 1 ? "font-bold text-ink animate-pulse" : "text-ink-muted-80"}`}>
            Deep-Web Intelligence Scan (Market standing & updates)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            loaderPhase >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {loaderPhase > 2 ? "✓" : "3"}
          </div>
          <span className={`text-xs ${loaderPhase === 2 ? "font-bold text-ink animate-pulse" : "text-ink-muted-80"}`}>
            Engineering Reconnaissance (Tech stack & devops infra)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            loaderPhase >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {loaderPhase === 3 ? "⌛" : "4"}
          </div>
          <span className={`text-xs ${loaderPhase === 3 ? "font-bold text-ink animate-pulse" : "text-ink-muted-80"}`}>
            Dossier Strategic Synthesis (Outreach & interview preps)
          </span>
        </div>
      </div>

    </div>
  );
}
