"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Wand2, Download, User, Sparkles } from "lucide-react";
import { useStartBuilder, useSendBuilderMessage, useExportResume } from "@/hooks/use-resume";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useJobDownload } from "@/hooks/use-job-download";

import Image from "next/image";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { ShieldCheck } from "lucide-react";

export function ResumeBuilderContent() {
  const router = useRouter();
  const { isFeatureEnabled, isLoading } = useFeatureFlags();

  if (!isLoading && !isFeatureEnabled("resume_builder_enabled")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-canvas px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center mb-8">
          <ShieldCheck className="w-10 h-10 text-ink/20" />
        </div>
        <h1 className="text-3xl font-semibold text-ink mb-4 tracking-tight">Feature Unavailable</h1>
        <p className="text-lg text-ink/40 max-w-md mb-10 leading-relaxed">
           The AI Resume Builder is currently under maintenance or disabled for your account. 
           Please check back later or contact support.
        </p>
        <Button 
          variant="outline" 
          className="rounded-pill border-hairline px-8 h-12"
          onClick={() => router.push("/resume")}
        >
          Back to Career Suite
        </Button>
      </div>
    );
  }
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"active" | "completed">("active");
  const [downloadJobId, setDownloadJobId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startMutation = useStartBuilder();
  const sendMutation = useSendBuilderMessage();
  const exportMutation = useExportResume();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, sendMutation.isPending]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDownloadJobId(params.get("downloadJob"));
  }, []);

  useJobDownload({
    jobId: downloadJobId,
    enabled: Boolean(downloadJobId),
    pendingMessage: "Preparing your resume export. Download will start automatically.",
    successMessage: "Your resume download has started.",
    onSuccess: () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("downloadJob");
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    },
  });

  const handleStart = () => {
    startMutation.mutate("My New Resume", {
      onSuccess: (res: any) => {
        const session = res.data;
        setSessionId(session._id);
        setMessages(session.chatHistory);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to start builder");
      },
    });
  };

  const handleSend = () => {
    if (!inputText.trim() || !sessionId || sendMutation.isPending) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    sendMutation.mutate({ sessionId, message: userMessage }, {
      onSuccess: (res: any) => {
        const session = res.data;
        setMessages(session.chatHistory);
        
        if (session.status === "completed") {
          setStatus("completed");
          toast.success("Resume generation complete!");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to send message");
      },
    });
  };

  const handleExport = () => {
    if (!sessionId) return;
    toast.info("Generating your resume PDF...");
    exportMutation.mutate({ sessionId, resumeData: {}, templateId: "modern" }, {
      onSuccess: () => {
        toast.success("Resume downloaded successfully!");
      },
      onError: () => {
        toast.error("Export failed. Please try again.");
      },
    });
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col">
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
                  <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">AI Architect</span>
                </div>
                <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                  Build your future <br />
                  <span className="text-ink/40">word by word.</span>
                </h1>
                <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-12">
                  An interactive AI conversation that crafts your professional story into a high-impact resume. Optimized for modern hiring.
                </p>
                <Button
                  size="lg"
                  className="rounded-pill text-white px-10 h-16 text-lg font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  ) : (
                    <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  )}
                  Start Your Resume Story
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl"
            >
              <Image
                src="/resume-builder-hero.png"
                alt="Resume Builder"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-canvas-parchment">
      {/* Header Tile */}
      <header className="bg-white border-b border-hairline py-6 section-padding">
        <div className="mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-canvas-parchment px-4 py-2 rounded-full border border-hairline flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                {status === "active" ? "Architecting..." : "Ready for Deployment"}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Resume AI Assistant</h1>
          </div>
          <AnimatePresence>
            {status === "completed" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Button 
                  onClick={handleExport} 
                  className="rounded-full px-6 h-12 bg-action-blue hover:bg-action-blue-hover gap-2 font-semibold shadow-lg shadow-action-blue/10" 
                  disabled={exportMutation.isPending}
                >
                  <Download className="w-4 h-4" />
                  {exportMutation.isPending ? "Generating PDF..." : "Export Resume"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden flex flex-col max-w-[1000px] mx-auto w-full pt-8">
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="pb-24 space-y-12">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] flex gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      msg.role === "user" 
                        ? "bg-action-blue text-white" 
                        : "bg-white border border-hairline text-action-blue"
                    }`}>
                      {msg.role === "user" ? <User size={20} /> : <Wand2 size={20} />}
                    </div>
                    <div className={`p-8 rounded-[24px] text-lg leading-relaxed shadow-sm ${ 
                      msg.role === "user" 
                        ? "bg-action-blue text-white rounded-tr-none" 
                        : "bg-white border border-hairline text-ink rounded-tl-none font-medium" 
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {sendMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[80%] flex gap-6">
                  <div className="mt-1 shrink-0 w-10 h-10 rounded-full bg-white border border-hairline flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-action-blue" />
                  </div>
                  <div className="p-8 rounded-[24px] bg-white/50 border border-hairline border-dashed rounded-tl-none italic text-ink-secondary opacity-60">
                    AI is synthesizing your professional narrative...
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Tile */}
        <div className="p-8 section-padding">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-action-blue/20 to-action-blue/5 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex gap-4 bg-white p-2 rounded-[28px] border border-hairline shadow-2xl shadow-ink/5">
              <Input
                placeholder={status === "completed" ? "Resume is finalized!" : "Share your details or ask a question..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={sendMutation.isPending || status === "completed"}
                className="h-16 bg-transparent text-lg border-none shadow-none rounded-2xl focus-visible:ring-0 px-6 text-ink placeholder:text-ink-secondary/40"
              />
              <Button 
                size="icon" 
                className="h-16 w-16 shrink-0 rounded-[22px] bg-action-blue hover:bg-action-blue-hover shadow-xl shadow-action-blue/20 active:scale-90 transition-all group" 
                onClick={handleSend} 
                disabled={sendMutation.isPending || status === "completed" || !inputText.trim()}
              >
                <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
