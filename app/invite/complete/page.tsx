"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InviteCompletePage() {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-[480px] space-y-6"
      >
        {/* Apple-style Success Icon */}
        <div className="mx-auto w-20 h-20 bg-[#34c759]/10 text-[#34c759] rounded-full flex items-center justify-center mb-6">
          <Check size={40} />
        </div>

        {/* Header Branding */}
        <span className="text-[12px] uppercase tracking-[0.2em] text-[#7a7a7a] font-semibold">AI Interview Platform</span>
        <h1 className="text-[#1d1d1f] text-[40px] font-semibold tracking-[-0.01em] mt-2 mb-2 leading-[1.1]">
          Interview Complete
        </h1>
        <p className="text-[#7a7a7a] text-[17px] leading-[1.47] max-w-md mx-auto mb-8 tracking-tight">
          Thank you for completing your scheduled interview session. Your responses, code submissions, and proctoring telemetry have been securely transmitted to the recruiting team.
        </p>

        <p className="text-[#1d1d1f] text-[14px] font-medium text-muted-foreground pt-4">
          You may now safely close this browser window.
        </p>
      </motion.div>
    </div>
  );
}
