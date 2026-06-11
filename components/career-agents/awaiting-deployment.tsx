import { Globe } from "lucide-react";

export function AwaitingDeployment() {
  return (
    <div className="h-full min-h-[480px] border border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-muted/10">
      <Globe size={48} className="text-primary opacity-20 mb-4 animate-hero-pulse" />
      <h4 className="font-extrabold text-xl font-display mb-1 text-ink">Awaiting Deployment</h4>
      <p className="text-ink-muted text-sm max-w-sm leading-relaxed">
        Provide target company parameters, select a hook focus, and deploy the agent to compile strategic corporate intelligence.
      </p>
    </div>
  );
}
