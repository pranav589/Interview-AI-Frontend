"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Terminal, Users } from "lucide-react";

export default function CareerAgentsHub() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-slide-up-fade">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Sparkles size={12} className="animate-pulse" />
          Autonomous Agent Ecosystem
        </div>
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight font-display bg-gradient-to-r from-ink to-ink-muted-80 bg-clip-text text-transparent">
          Career Agents
        </h1>
        <p className="text-ink-muted text-base max-w-xl leading-relaxed">
          Deploy deep-reasoning autonomous AI agents to research target companies, map tech stacks, and script high-conversion outreach DMs.
        </p>
      </div>

      <div className="space-y-6">
        <Link href="/dashboard/career-agents/researcher" className="block group">
          <div className="relative border rounded-2xl p-8 bg-card/60 backdrop-blur-md hover:border-primary transition-all duration-300 hover:shadow-apple-card overflow-hidden">
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-300" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/15 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display group-hover:text-primary transition-colors">
                      Autonomous Company & Network Researcher
                    </h2>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
                      Active Agent
                    </span>
                  </div>
                </div>
                <p className="text-ink-muted-80 text-sm leading-relaxed">
                  Provide a company name and target role. The agent autonomously invokes web search tools to map real-time product updates, technology stacks, and construct customized cold outreach campaigns with integrated interview preparation.
                </p>
                <div className="flex items-center gap-4 text-xs text-ink-muted-48">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-green-500" /> Tavily Search Integrated
                  </span>
                  <span>•</span>
                  <span>LangChain Logic</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center bg-secondary w-12 h-12 rounded-full text-ink group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 self-end md:self-center">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/career-agents/scout" className="block group">
          <div className="relative border rounded-2xl p-8 bg-card/60 backdrop-blur-md hover:border-primary transition-all duration-300 hover:shadow-apple-card overflow-hidden">
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-300" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/15 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display group-hover:text-primary transition-colors">
                      Network Scout & Decision-Maker Matcher
                    </h2>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider">
                      New Agent
                    </span>
                  </div>
                </div>
                <p className="text-ink-muted-80 text-sm leading-relaxed">
                  Map target divisions, engineering locations, and organizational structures. Discover target managers, directors, leads, and recruiters at a target company and role, and generate hyper-personalized LinkedIn invites (under 300 characters) and cold outreach emails.
                </p>
                <div className="flex items-center gap-4 text-xs text-ink-muted-48">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={14} className="text-green-500" /> Org Mapping Enabled
                  </span>
                  <span>•</span>
                  <span>Resilient Search</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center bg-secondary w-12 h-12 rounded-full text-ink group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 self-end md:self-center">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
