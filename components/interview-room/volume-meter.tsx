"use client";

import { motion } from "framer-motion";

interface VolumeMeterProps {
  volume: number; // 0 to 100
}

export const VolumeMeter = ({ volume }: VolumeMeterProps) => {
  // Determine color based on volume level
  const getColor = (v: number) => {
    if (v < 60) return "bg-emerald-500";
    if (v < 85) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Microphone Sensitivity
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${volume > 5 ? 'animate-pulse ' + getColor(volume) : 'bg-muted'}`} />
          <span className="text-[10px] font-bold font-mono text-muted-foreground">
            {Math.round(volume)}%
          </span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden relative border border-border/5">
        <motion.div
          className={`h-full ${getColor(volume)} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(volume, 100)}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.08 }}
        />
        
        {/* Visual indicators for regions */}
        <div className="absolute top-0 left-[60%] h-full w-[1px] bg-background/20" />
        <div className="absolute top-0 left-[85%] h-full w-[1px] bg-background/20" />
      </div>
    </div>
  );
};
