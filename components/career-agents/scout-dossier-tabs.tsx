import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Globe, Cpu, Send, Users, Info, Award, Star } from "lucide-react";

export interface ScoutDossier {
  isSimulated: boolean;
  organizationOverview: {
    keyDivisions: string[];
    engineeringHubs: string[];
    hiringPace: string;
    strategicFocus: string[];
  };
  decisionMakers: {
    name: string;
    title: string;
    division: string;
    linkedinUrl: string;
    relevanceScore: number;
    whyTarget: string;
    networkingHook: string;
  }[];
  recruiters: {
    name: string;
    title: string;
    linkedinUrl: string;
    networkingHook: string;
  }[];
  currentEmployees: {
    name: string;
    title: string;
    linkedinUrl: string;
  }[];
  outreachMatrix: {
    warmColdReferralEmail: string;
    strategicFollowUp: string;
  };
}

interface ScoutDossierTabsProps {
  result: ScoutDossier;
  copyText: (text: string, section: string) => void;
  copiedSection: string | null;
}

export function ScoutDossierTabs({ result, copyText, copiedSection }: ScoutDossierTabsProps) {
  const [activeTab, setActiveTab] = useState<"org" | "leads" | "recruiters" | "outreach">("org");

  return (
    <div className="border rounded-2xl bg-card shadow-apple-card overflow-hidden animate-slide-up-fade">
      
      {/* Tab Navigation */}
      <div className="flex bg-secondary p-1 border-b overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("org")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "org" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Globe size={14} /> Org Map & Strategy
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "leads" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Users size={14} /> Decision-Makers & DMs
        </button>
        <button
          onClick={() => setActiveTab("recruiters")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "recruiters" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Cpu size={14} /> Recruiter Panel
        </button>
        <button
          onClick={() => setActiveTab("outreach")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "outreach" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Send size={14} /> Outreach Matrix
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        
        {/* Mode alert if simulated */}
        {result.isSimulated && (
          <div className="flex items-center gap-2.5 p-3.5 mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
            <Info size={16} className="flex-shrink-0" />
            <span><strong>Simulation Fallback:</strong> Search API key was not present. Dossier compiled via parametric LLM database context.</span>
          </div>
        )}

        {/* Tab: Org Map */}
        {activeTab === "org" && (
          <div className="space-y-6 animate-slide-up-fade">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Strategic Focus & Priorities</h4>
              <ul className="space-y-2.5">
                {result.organizationOverview.strategicFocus.map((focus, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-ink-muted-80">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span className="font-sans">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <>{children}</>,
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline hover:text-primary-focus font-semibold"
                            />
                          )
                        }}
                      >
                        {focus}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="bg-secondary/35 border rounded-xl p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Users size={14} /> Engineering Hubs & Offices
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.organizationOverview.engineeringHubs.map((hub, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-card border rounded-lg font-bold">
                      {hub}
                    </span>
                  ))}
                  {result.organizationOverview.engineeringHubs.length === 0 && (
                    <span className="text-xs text-ink-muted-48 italic">No office hubs detected in searches.</span>
                  )}
                </div>
              </div>
              <div className="bg-secondary/35 border rounded-xl p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Award size={14} /> Active Divisions
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.organizationOverview.keyDivisions.map((division, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-card border rounded-lg font-bold">
                      {division}
                    </span>
                  ))}
                  {result.organizationOverview.keyDivisions.length === 0 && (
                    <span className="text-xs text-ink-muted-48 italic">No divisions detected in searches.</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-1">Hiring Pace & Trends</h4>
              <div className="text-sm text-ink-muted-80 leading-relaxed font-sans bg-secondary/25 border rounded-xl p-4">
                <ReactMarkdown
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary-focus font-semibold"
                      />
                    )
                  }}
                >
                  {result.organizationOverview.hiringPace}
                </ReactMarkdown>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-3">Active Team Directory (Current Employees)</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.currentEmployees?.map((employee, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-secondary/20 border rounded-xl hover:border-primary/30 transition-all duration-300">
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-ink font-display block">{employee.name}</span>
                      <span className="text-[11px] text-ink-muted-80 font-medium block">{employee.title}</span>
                    </div>
                    <a
                      href={employee.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all font-bold"
                    >
                      Profile
                    </a>
                  </div>
                ))}
                {(!result.currentEmployees || result.currentEmployees.length === 0) && (
                  <div className="sm:col-span-2 text-center py-6 text-xs text-ink-muted-48 italic border border-dashed rounded-xl">
                    No active team members detected in search indexes.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Decision Makers */}
        {activeTab === "leads" && (
          <div className="space-y-6 animate-slide-up-fade">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">High-Relevance Engineering Leaders</h4>
            <div className="space-y-4">
              {result.decisionMakers.map((lead, idx) => (
                <div key={idx} className="border rounded-2xl bg-card p-5 relative hover:border-primary/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-ink font-display">{lead.name}</span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          {lead.division}
                        </span>
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                          <Star size={10} className="fill-current" /> Match Score: {lead.relevanceScore}/10
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted-80 font-medium">{lead.title}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={lead.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/95 transition-all font-bold"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted-80">Relevance Strategy</span>
                      <p className="text-xs text-ink-muted-80 leading-relaxed font-sans">{lead.whyTarget}</p>
                    </div>

                    <div className="bg-secondary/40 border rounded-xl p-4 space-y-3 relative group">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Connection Note (&lt;300 Chars)</span>
                        <button
                          onClick={() => copyText(lead.networkingHook, `dm-${idx}`)}
                          className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-all font-bold cursor-pointer"
                        >
                          {copiedSection === `dm-${idx}` ? <Check size={10} /> : <Copy size={10} />}
                          {copiedSection === `dm-${idx}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed italic font-sans">
                        "{lead.networkingHook}"
                      </p>
                      <span className="absolute bottom-2 right-3 text-[9px] text-ink-muted-48 font-bold font-mono">
                        {lead.networkingHook.length} chars
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {result.decisionMakers.length === 0 && (
                <div className="text-center py-8 text-sm text-ink-muted-48 italic border border-dashed rounded-xl">
                  No decision makers mapped in search indexes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Recruiters */}
        {activeTab === "recruiters" && (
          <div className="space-y-6 animate-slide-up-fade">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Talent Acquisition & Hiring Teams</h4>
            <div className="space-y-4">
              {result.recruiters.map((recruiter, idx) => (
                <div key={idx} className="border rounded-2xl bg-card p-5 relative hover:border-primary/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-ink font-display">{recruiter.name}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                          Recruitment Specialist
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted-80 font-medium">{recruiter.title}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={recruiter.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/95 transition-all font-bold"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  </div>

                  <div className="bg-secondary/40 border rounded-xl p-4 space-y-3 relative group">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Recruiter Outreach Hook</span>
                      <button
                        onClick={() => copyText(recruiter.networkingHook, `rec-${idx}`)}
                        className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-all font-bold cursor-pointer"
                      >
                        {copiedSection === `rec-${idx}` ? <Check size={10} /> : <Copy size={10} />}
                        {copiedSection === `rec-${idx}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed italic font-sans">
                      "{recruiter.networkingHook}"
                    </p>
                    <span className="absolute bottom-2 right-3 text-[9px] text-ink-muted-48 font-bold font-mono">
                      {recruiter.networkingHook.length} chars
                    </span>
                  </div>
                </div>
              ))}
              {result.recruiters.length === 0 && (
                <div className="text-center py-8 text-sm text-ink-muted-48 italic border border-dashed rounded-xl">
                  No recruiter channels mapped in search indexes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Outreach Matrix */}
        {activeTab === "outreach" && (
          <div className="space-y-6 animate-slide-up-fade">
            {/* Warm referral cold email */}
            <div className="bg-card border rounded-xl p-5 relative group hover:border-primary/50 transition-colors duration-300">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Send size={12} /> Strategic Referral Cold Email
                </span>
                <button
                  onClick={() => copyText(result.outreachMatrix.warmColdReferralEmail, "email")}
                  className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all font-bold cursor-pointer"
                >
                  {copiedSection === "email" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === "email" ? "Copied!" : "Copy Email"}
                </button>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                <ReactMarkdown
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary-focus font-semibold"
                      />
                    )
                  }}
                >
                  {result.outreachMatrix.warmColdReferralEmail}
                </ReactMarkdown>
              </div>
            </div>

            {/* Strategic Follow up */}
            <div className="bg-muted/15 border rounded-xl p-5">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-ink-muted-80 uppercase tracking-wider">Scout Follow-up (5 Days Later)</span>
                <button
                  onClick={() => copyText(result.outreachMatrix.strategicFollowUp, "followup")}
                  className="flex items-center gap-1.5 text-xs bg-secondary text-ink px-2.5 py-1.5 rounded-lg hover:bg-secondary-hover border transition-all font-bold cursor-pointer"
                >
                  {copiedSection === "followup" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === "followup" ? "Copied!" : "Copy Follow-Up"}
                </button>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                <ReactMarkdown
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary-focus font-semibold"
                      />
                    )
                  }}
                >
                  {result.outreachMatrix.strategicFollowUp}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
