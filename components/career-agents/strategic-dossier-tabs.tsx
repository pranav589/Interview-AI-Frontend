import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Globe, Cpu, Send, BookOpen, Info, Users, Award, ShieldAlert } from "lucide-react";

export interface Dossier {
  isSimulated: boolean;
  intelligenceBrief: {
    recentUpdates: string[];
    businessChallenges: string[];
    competitorAnalysis: string;
    cultureAlignment: string;
    marketPosition: string;
  };
  techStack: {
    frontend: string[];
    backend: string[];
    devopsInfra: string[];
    inferredFocus: string;
  };
  outreachDraft: {
    subjectLine: string;
    linkedinDM: string;
    coldEmail: string;
    followUp: string;
  };
  interviewEdge: {
    resumeGaps: string[];
    questions: {
      question: string;
      strategy: string;
      pitfalls: string;
    }[];
  };
}

interface StrategicDossierTabsProps {
  result: Dossier;
  copyText: (text: string, section: string) => void;
  copiedSection: string | null;
}

export function StrategicDossierTabs({ result, copyText, copiedSection }: StrategicDossierTabsProps) {
  const [activeTab, setActiveTab] = useState<"brief" | "tech" | "outreach" | "interview">("brief");

  return (
    <div className="border rounded-2xl bg-card shadow-apple-card overflow-hidden animate-slide-up-fade">
      
      {/* Tab Navigation */}
      <div className="flex bg-secondary p-1 border-b overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("brief")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "brief" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Globe size={14} /> Intelligence Brief
        </button>
        <button
          onClick={() => setActiveTab("tech")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "tech" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Cpu size={14} /> Engineering Stack
        </button>
        <button
          onClick={() => setActiveTab("outreach")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "outreach" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <Send size={14} /> Outreach Campaign
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          className={`flex items-center gap-1.5 px-4 py-3 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeTab === "interview" ? "bg-card text-primary shadow-sm" : "text-ink-muted-80 hover:text-ink"
          }`}
        >
          <BookOpen size={14} /> Interview Edge
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

        {/* Tab: Brief */}
        {activeTab === "brief" && (
          <div className="space-y-6 animate-slide-up-fade">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Market Standing & Position</h4>
              <div className="text-sm text-ink-muted-80 leading-relaxed font-sans">
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
                  {result.intelligenceBrief.marketPosition}
                </ReactMarkdown>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="bg-secondary/35 border rounded-xl p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Users size={14} /> Culture & Workplace Values
                </h4>
                <div className="text-xs text-ink-muted-80 leading-relaxed font-sans">
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
                    {result.intelligenceBrief.cultureAlignment}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="bg-secondary/35 border rounded-xl p-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Award size={14} /> Competitor & Market Analysis
                </h4>
                <div className="text-xs text-ink-muted-80 leading-relaxed font-sans">
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
                    {result.intelligenceBrief.competitorAnalysis}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Recent Updates & Announcements</h4>
              <ul className="space-y-2.5">
                {result.intelligenceBrief.recentUpdates.map((update, idx) => (
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
                        {update}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-border" />

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-destructive mb-2">Primary Business Hurdles</h4>
              <ul className="space-y-2.5">
                {result.intelligenceBrief.businessChallenges.map((challenge, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-ink-muted-80">
                    <span className="text-destructive font-bold mt-0.5">•</span>
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
                        {challenge}
                      </ReactMarkdown>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab: Tech Stack */}
        {activeTab === "tech" && (
          <div className="space-y-6 animate-slide-up-fade">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Frontend Engineering Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {result.techStack.frontend.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-secondary rounded-lg font-bold border border-border">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 mb-2">Backend & Architecture</h4>
                <div className="flex flex-wrap gap-2">
                  {result.techStack.backend.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-secondary rounded-lg font-bold border border-border">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 mb-2">Infrastructure & DevOps</h4>
                <div className="flex flex-wrap gap-2">
                  {result.techStack.devopsInfra.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs bg-secondary rounded-lg font-bold border border-border">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary mb-2">Inferred Technical Direction</h4>
              <p className="text-sm italic text-ink-muted-80 leading-relaxed font-sans">{result.techStack.inferredFocus}</p>
            </div>
          </div>
        )}

        {/* Tab: Outreach */}
        {activeTab === "outreach" && (
          <div className="space-y-6 animate-slide-up-fade">
            {/* LinkedIn DM */}
            <div className="bg-card border rounded-xl p-5 relative group hover:border-primary/50 transition-colors duration-300">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Send size={12} /> LinkedIn Direct Message (Punchy DM)
                </span>
                <button
                  onClick={() => copyText(result.outreachDraft.linkedinDM, "linkedin")}
                  className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all font-bold cursor-pointer"
                >
                  {copiedSection === "linkedin" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === "linkedin" ? "Copied!" : "Copy DM"}
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
                  {result.outreachDraft.linkedinDM}
                </ReactMarkdown>
              </div>
            </div>

            {/* Cold Email */}
            <div className="bg-card border rounded-xl p-5 relative group hover:border-primary/50 transition-colors duration-300">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Globe size={12} /> Personalized Email Campaign
                </span>
                <button
                  onClick={() => copyText(result.outreachDraft.coldEmail, "email")}
                  className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all font-bold cursor-pointer"
                >
                  {copiedSection === "email" ? <Check size={14} /> : <Copy size={14} />}
                  {copiedSection === "email" ? "Copied!" : "Copy Email"}
                </button>
              </div>
              <div className="text-xs font-sans text-ink-muted-80 mb-3 bg-secondary/50 p-2.5 rounded-lg">
                <strong>Subject:</strong> {result.outreachDraft.subjectLine}
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
                  {result.outreachDraft.coldEmail}
                </ReactMarkdown>
              </div>
            </div>

            {/* Follow-Up */}
            <div className="bg-muted/15 border rounded-xl p-5">
              <div className="flex justify-between items-center mb-3 pb-2 border-b">
                <span className="text-xs font-bold text-ink-muted-80 uppercase tracking-wider">Polite Follow-up (4 Days Later)</span>
                <button
                  onClick={() => copyText(result.outreachDraft.followUp, "followup")}
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
                  {result.outreachDraft.followUp}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Interview Edge */}
        {activeTab === "interview" && (
          <div className="space-y-6 animate-slide-up-fade">
            
            {/* Resume Scrutiny Gaps */}
            <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-destructive mb-3 flex items-center gap-1.5">
                <ShieldAlert size={14} /> Resume Scrutiny areas (Anticipated Gaps)
              </h4>
              <ul className="space-y-2">
                {result.interviewEdge.resumeGaps.map((gap, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-ink-muted-80 font-sans">
                    <span className="text-destructive font-bold">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interview Questions list */}
            <div className="space-y-4">
              {result.interviewEdge.questions.map((item, idx) => (
                <div key={idx} className="border rounded-xl p-5 bg-muted/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-3 w-full">
                      <h5 className="font-bold text-sm leading-tight text-ink font-display">{item.question}</h5>
                      
                      <div className="grid md:grid-cols-2 gap-4 pt-1">
                        <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-lg text-xs font-sans">
                          <span className="font-bold text-green-600 block mb-1">Answering Strategy:</span>
                          <span className="text-ink-muted-80 leading-relaxed">{item.strategy}</span>
                        </div>
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs font-sans">
                          <span className="font-bold text-red-500 block mb-1">Pitfalls to Avoid:</span>
                          <span className="text-ink-muted-80 leading-relaxed">{item.pitfalls}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
