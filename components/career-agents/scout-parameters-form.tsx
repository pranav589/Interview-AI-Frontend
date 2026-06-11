import { FormEvent } from "react";
import { Sparkles, Building, Loader2, Users } from "lucide-react";

interface ScoutParametersFormProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  divisionFilter: string;
  setDivisionFilter: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export function ScoutParametersForm({
  companyName,
  setCompanyName,
  targetRole,
  setTargetRole,
  divisionFilter,
  setDivisionFilter,
  onSubmit,
  isLoading
}: ScoutParametersFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-card border rounded-2xl p-6 shadow-apple-card relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
      <h3 className="font-bold text-lg font-display flex items-center gap-2 border-b pb-3 mb-2 text-ink">
        <Users size={18} className="text-primary" /> Scout Parameters
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
          placeholder="E.g., Senior Software Engineer"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted-80 mb-1">
          Division Filter (Optional)
        </label>
        <input
          type="text"
          className="w-full p-3 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-sans"
          placeholder="E.g., Platform Engineering, Infrastructure"
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground p-3.5 rounded-xl font-bold hover:bg-primary/95 transition-all duration-300 flex items-center justify-center disabled:opacity-75 shadow-sm cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={18} />
            Scout Loops Active...
          </>
        ) : (
          <>
            <Sparkles size={18} className="mr-2 animate-pulse" />
            Deploy Scout Agent
          </>
        )}
      </button>
    </form>
  );
}
