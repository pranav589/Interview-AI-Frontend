'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DEFAULT_FREE_CREDITS } from "@/lib/constants";

interface CreditLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditLimitModal({ isOpen, onClose }: CreditLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-background rounded-2xl">
        <DialogTitle className="hidden" />
        <div className="relative">
          {/* Header Gradient Area */}
          <div className="h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center relative overflow-hidden">
             <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 rotate: [0, 10, 0]
               }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" 
             />
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30"
             >
                <Zap className="w-10 h-10 text-white fill-white shadow-xl" />
             </motion.div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">
                Out of Credits
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                You've used all <span className="font-bold text-foreground">{DEFAULT_FREE_CREDITS}</span> free monthly interview credits. Upgrade to <span className="text-amber-600 font-bold uppercase tracking-wider text-xs">Pro</span> to keep practicing!
              </p>
            </div>

            <div className="space-y-3 pt-2">
               <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-start gap-3">
                  <div className="mt-1 p-1 bg-amber-500/10 rounded-md">
                     <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Unlimited Practice Sessions</p>
                    <p className="text-[10px] text-muted-foreground">Never worry about limits again.</p>
                  </div>
               </div>
               <div className="p-4 bg-muted/50 rounded-xl border border-border flex items-start gap-3">
                  <div className="mt-1 p-1 bg-primary/10 rounded-md">
                     <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Detailed Feedback & Model Answers</p>
                    <p className="text-[10px] text-muted-foreground">Go beyond just a score.</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Link href="/pricing" className="w-full">
                <Button className="w-full h-12 text-base font-bold gap-2 shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-none">
                  Upgrade to Pro Now
                  <Sparkles className="w-4 h-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-muted-foreground hover:bg-muted/50 font-medium"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
