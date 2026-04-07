"use client";

import { motion } from "framer-motion";
import { 
  Mic, 
  Video, 
  Terminal, 
  User, 
  Brain, 
  TrendingUp,
  Target,
  Sparkles,
  Command
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SampleReplay() {
  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-muted/20 shadow-2xl max-w-5xl mx-auto">
      <CardContent className="p-0">
        {/* Mock Interview Header */}
        <div className="bg-background border-b p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Command className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-black italic uppercase tracking-tighter">Live Session Replay</p>
           </div>
           <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/5 border-emerald-500/20">
                 Recording Active
              </Badge>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
           </div>
        </div>

        <div className="p-4 md:p-6 bg-background/50">
          {/* Main Content: Split Grid like the real Interview Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
             {/* Left side: AI Avatar Mockup */}
             <div className="aspect-video bg-card border-2 border-primary/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                
                {/* Simplified Avatar Animation */}
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 relative">
                      <Brain className="w-10 h-10 text-primary" />
                      {/* Pulse rings */}
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-primary"
                      />
                   </div>
                   <div className="mt-4 flex gap-1 h-4 items-end">
                      {[0.4, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
                        <motion.div 
                           key={i}
                           animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }}
                           transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                           className="w-1.5 bg-primary rounded-full"
                        />
                      ))}
                   </div>
                   <p className="mt-2 text-[10px] font-bold uppercase text-primary tracking-widest animate-pulse">AI Speaking...</p>
                </div>

                <div className="absolute bottom-3 left-3">
                   <Badge className="bg-black/60 backdrop-blur-md text-[10px] border-white/10 uppercase">AI Interviewer</Badge>
                </div>
             </div>

             {/* Right side: User Camera Mockup */}
             <div className="aspect-video bg-[#0a0a0a] rounded-2xl flex flex-col items-center justify-center relative border-2 border-border shadow-inner">
                <User className="w-16 h-16 text-muted-foreground/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <p className="text-[10px] font-mono text-muted-foreground/40 italic">Candidate Camera Preview</p>
                </div>
                
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                   <Badge className="bg-black/60 backdrop-blur-md text-[10px] border-white/10 uppercase">Candidate (You)</Badge>
                   <div className="flex gap-1">
                      <div className="w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"><Mic className="w-2.5 h-2.5 text-white/40" /></div>
                      <div className="w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"><Video className="w-2.5 h-2.5 text-white/40" /></div>
                   </div>
                </div>

                {/* Simulated Volume Meter at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-b-2xl">
                   <motion.div 
                     animate={{ width: ["20%", "45%", "30%", "60%", "25%"] }}
                     transition={{ duration: 1.5, repeat: Infinity }}
                     className="h-full bg-emerald-500"
                   />
                </div>
             </div>
          </div>

          {/* Transcript Section Mockup */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session Transcript</span>
             </div>

             <div className="bg-card border-2 border-primary/5 rounded-xl p-4 space-y-4 max-h-[180px] overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent z-10" />
                
                <div className="flex gap-3">
                   <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">AI</div>
                   <p className="text-xs leading-relaxed font-medium">Explain how indexing in MongoDB improves search performance but impacts write operations.</p>
                </div>
                
                <div className="flex gap-3">
                   <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">ME</div>
                   <div className="space-y-1">
                      <p className="text-xs leading-relaxed text-muted-foreground">Indexing creates a pointer-based structure that allows the engine to find documents without a full collection scan...</p>
                      <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-3.5 bg-primary/40 rounded-sm inline-block translate-y-0.5 ml-1"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Mini Insights Row */}
          <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-border/50">
             <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Score: 92%</span>
             </div>
             <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-500" />
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Technical Depth: High</span>
             </div>
             <div className="flex items-center gap-2 ml-auto">
                <Sparkles className="w-3 h-3 text-primary animate-sparkle" />
                <span className="text-[10px] italic text-primary font-bold underline decoration-primary/20 underline-offset-4">AI Feedback Summary Ready</span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
