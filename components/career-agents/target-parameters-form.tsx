import { FormEvent } from "react";
import { Sparkles, Building, Loader2 } from "lucide-react";

interface TargetParametersFormProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  contactName: string;
  setContactName: (val: string) => void;
  hookType: string;
  setHookType: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export function TargetParametersForm({
  companyName,
  setCompanyName,
  targetRole,
  setTargetRole,
  contactName,
  setContactName,
  hookType,
  setHookType,
  onSubmit,
  isLoading
}: TargetParametersFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-card border rounded-2xl p-6 shadow-apple-card relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
      <h3 className="font-bold text-lg font-display flex items-center gap-2 border-b pb-3 mb-2 text-ink">
        <Building size={18} className="text-primary" /> Target Parameters
      </h3>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted-80 mb-1">
          Target Company
        </label>
        <input
          type="text"
          className="w-full p-3 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
          placeholder="E.g., Stripe, Vercel"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted-80 mb-1">
          Target Role / Title
        </label>
        <input
          type="text"
          className="w-full p-3 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
          placeholder="E.g., Senior Frontend Engineer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted-80 mb-1">
          Target Contact Name (Optional)
        </label>
        <input
          type="text"
          className="w-full p-3 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
          placeholder="E.g., John Doe, Tech Lead"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted-80 mb-1">
          Strategic Hook Focus
        </label>
        <select
          className="w-full p-3 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
          value={hookType}
          onChange={(e) => setHookType(e.target.value)}
          disabled={isLoading}
        >
          <option value="Product Launch Hook">Product Launch / Recent Release</option>
          <option value="Shared Tech Hook">Technology Stack Focus</option>
          <option value="Pain Point Hook">Business Challenge Resolution</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground p-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all duration-300 flex items-center justify-center disabled:opacity-75 shadow-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={18} />
            Agent Loops Active...
          </>
        ) : (
          <>
            <Sparkles size={18} className="mr-2 animate-pulse" />
            Deploy Autonomous Agent
          </>
        )}
      </button>
    </form>
  );
}
