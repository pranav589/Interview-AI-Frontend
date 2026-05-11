"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Wand2, ChevronRight, ArrowRight, FileText, Layout, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export function ResumeLandingContent() {
  const tools = [
    {
      title: "Resume Analyzer",
      description: "Get an ATS score and detailed feedback on how to improve your resume content and structure.",
      icon: <Search className="w-6 h-6 text-action-blue" />,
      link: "/resume/analyzer",
      credits: "1 Credit",
      tier: "Free",
      isPro: false,
      feature: "resume_analyzer_enabled",
    },
    {
      title: "JD Matcher",
      description: "Align your resume with specific job descriptions. Automatically rewrite bullets to match requirements.",
      icon: <Sparkles className="w-6 h-6 text-action-blue" />,
      link: "/resume/jd-match",
      credits: "1 Credit",
      tier: "Pro",
      isPro: true,
      feature: "jd_matcher_enabled",
      isComingSoon:true
    },
    {
      title: "AI Resume Builder",
      description: "Build a professional resume from scratch with our interactive AI guide and industry templates.",
      icon: <Wand2 className="w-6 h-6 text-action-blue" />,
      link: "/resume/builder",
      credits: "5 Credits",
      tier: "Pro",
      isPro: true,
      feature: "resume_builder_enabled",
      isComingSoon:true

    },
  ];

  return (
    <div className="w-full bg-canvas">
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Career Suite</span>
              </div>
              
              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Resume <br />
                <span className="text-ink/40">Intelligence.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-12">
                A suite of high-performance AI engines designed to transform your professional narrative. Recruiter-grade insights, ATS-optimized architecture.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="rounded-pill bg-action-blue hover:bg-action-blue-hover text-white px-10 h-14 text-lg font-semibold transition-all active:scale-95 shadow-xl shadow-action-blue/20"
                  onClick={() => document.getElementById('tools-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Suite
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                {/* <Button 
                  variant="outline" 
                  className="rounded-pill border-hairline bg-canvas hover:bg-canvas-parchment px-10 h-14 text-lg font-normal transition-all active:scale-95"
                >
                  Watch Demo
                </Button> */}
              </div>
            </motion.div>

            {/* Micro Stats */}
            <motion.div 
              className="flex flex-wrap gap-12 pt-10 border-t border-hairline max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-ink">94%</p>
                <p className="text-[10px] text-ink/30 uppercase tracking-[0.1em] font-bold">ATS Pass Rate</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-ink">10k+</p>
                <p className="text-[10px] text-ink/30 uppercase tracking-[0.1em] font-bold">Resumes Built</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-ink">2.5x</p>
                <p className="text-[10px] text-ink/30 uppercase tracking-[0.1em] font-bold">More Interviews</p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Image 
              src="/resume-hub-hero-v2.png" 
              alt="Resume Intelligence Ecosystem" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: STUDIO SUITE (Parchment Section) - Store Grid Style */}
      <section id="tools-grid" className="bg-canvas-parchment py-24 border-b border-hairline">
        <div className="mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <Badge variant="outline" className="rounded-pill px-4 py-1.5 border-action-blue/10 text-action-blue bg-action-blue/5 font-medium tracking-tight mb-6 text-xs uppercase">
                Specialized Instruments
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-semibold tracking-[-0.04em] text-ink leading-[1.1]">
                Tools built for <br /> every professional.
              </h2>
            </div>
            <p className="text-lg text-ink/40 max-w-sm leading-relaxed pb-2">
              High-performance engines optimized for speed, accuracy, and recruiter impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, idx) => (
              // <FeatureFlag key={tool.title} name={tool.feature}>
                <motion.div 
                key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex flex-col bg-canvas border border-hairline rounded-lg overflow-hidden hover:border-action-blue/20 transition-all duration-500 hover:shadow-xl hover:shadow-action-blue/5 ${tool.isComingSoon ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Badge variant="outline" className={`absolute right-4 top-4 rounded-pill px-4 py-1.5 border-action-blue/10 text-action-blue bg-action-blue/5 font-medium tracking-tight mb-6 text-xs uppercase ${tool.isComingSoon ? "cursor-not-allowed opacity-50" : ""}`}>
                    {tool.isComingSoon ? "Coming Soon" : "New"}
                  </Badge>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-10 w-12 h-12 rounded-xl bg-canvas-parchment flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {tool.icon}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold text-ink tracking-tight">
                          {tool.title}
                        </h3>
                        {/* {tool.isPro && (
                          <span className="text-[9px] font-bold tracking-[0.1em] text-white bg-action-blue px-2 py-0.5 rounded-[4px] uppercase">PRO</span>
                        )} */}
                      </div>
                      <p className="text-base text-ink/40 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    
                    {/* <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-hairline">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-ink/20 font-bold">Tier</p>
                        <p className="text-sm font-semibold text-ink">{tool.tier}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-ink/20 font-bold">Cost</p>
                        <p className="text-sm font-semibold text-ink">{tool.credits}</p>
                      </div>
                    </div> */}
                  </div>
                  
                  <div className="px-8 pb-8">
                    <Button asChild className={`w-full rounded-pill h-12 ${tool.isComingSoon ? "cursor-not-allowed opacity-50" : "bg-action-blue hover:bg-action-blue-hover text-white font-normal text-base transition-all active:scale-95 group/btn"} ${tool.isComingSoon?"cursor-not-allowed opacity-50":""}`}>
                      <Link href={tool.link}>
                        {tool.isComingSoon ? "Coming Soon" : "Launch Tool"}
                        {!tool.isComingSoon && <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />}
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              // </FeatureFlag>
            ))}
          </div>
        </div>
      </section>

      
      {/* <section className="bg-canvas py-24 overflow-hidden">
        <div className="mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-action-blue/5 border border-action-blue/10 text-action-blue font-semibold text-xs tracking-tight uppercase">
                <ShieldCheck className="w-4 h-4" />
                Enterprise-Grade Security
              </div>
              <h2 className="text-5xl lg:text-[80px] font-semibold tracking-[-0.05em] leading-[0.9] text-ink">
                Your Professional <br /> Vault.
              </h2>
              <p className="text-lg lg:text-2xl text-ink/40 max-w-xl leading-[1.3] font-normal">
                A centralized hub for your professional DNA. Securely store multiple versions, track performance, and deploy instantly.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6">
                {[
                  { icon: <Layout className="w-5 h-5" />, title: "Version Control", desc: "Granular history tracking for every narrative change." },
                  { icon: <Zap className="w-5 h-5" />, title: "Quick Deploy", desc: "Instant export to PDF or high-fidelity templates." }
                ].map((item) => (
                  <div key={item.title} className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-canvas-parchment flex items-center justify-center text-ink shrink-0 border border-hairline shadow-sm">
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-ink leading-tight">{item.title}</p>
                      <p className="text-base text-ink/30 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <Button size="lg" className="rounded-pill bg-action-blue hover:bg-action-blue-hover text-white px-10 h-16 text-xl font-normal transition-all active:scale-95 group/vault" asChild>
                  <Link href="/resume/vault">
                    Access Vault
                    <ArrowRight className="w-6 h-6 ml-3 group-hover/vault:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-square max-w-xl mx-auto lg:mr-0 group"
            >
              <div className="absolute inset-0 bg-canvas-parchment rounded-[48px] border border-hairline group-hover:scale-[1.01] transition-transform duration-1000" />
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="absolute top-1/4 left-1/4 w-3/5 h-4/5 bg-white border border-hairline rounded-2xl shadow-xl -rotate-3 z-10 p-8 space-y-3">
                  <div className="w-1/2 h-2 bg-ink/5 rounded-full" />
                  <div className="w-full h-2 bg-ink/5 rounded-full" />
                  <div className="w-full h-2 bg-ink/5 rounded-full" />
                  <div className="w-3/4 h-2 bg-ink/5 rounded-full" />
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-3/5 h-4/5 bg-white border border-hairline rounded-2xl shadow-lg rotate-3 p-8 space-y-3">
                  <div className="w-2/3 h-2 bg-ink/5 rounded-full" />
                  <div className="w-full h-2 bg-ink/5 rounded-full" />
                  <div className="w-full h-2 bg-ink/5 rounded-full" />
                  <div className="w-1/2 h-2 bg-ink/5 rounded-full" />
                </div>
                <FileText className="w-1/4 h-1/4 text-ink/[0.02] absolute -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
