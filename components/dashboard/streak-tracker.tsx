'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Star, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StreakTrackerProps {
  streak: number;
  percentile: number;
  isCompact?: boolean;
}

export function StreakTracker({ streak, percentile, isCompact = false }: StreakTrackerProps) {
  if (isCompact) {
    return (
       <Card className="transition-all border-hairline h-full group hover:bg-secondary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Practice Streak</CardTitle>
          <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Flame className={`h-4 w-4 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold flex items-baseline gap-1">
            {streak}
            <span className="text-sm font-normal text-muted-foreground">Days</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <Card className="relative overflow-hidden group border-primary/5 hover:border-primary/20 transition-colors shadow-sm h-full">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Flame size={120} strokeWidth={1} />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
             <div className="relative">
                <motion.div 
                   animate={{ scale: streak > 0 ? [1, 1.1, 1] : 1 }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className={`p-3 rounded-2xl ${streak > 0 ? 'bg-orange-500/10 text-orange-500 shadow-inner' : 'bg-muted/10 text-muted-foreground'}`}
                >
                   <Flame className={streak > 0 ? "fill-orange-500" : ""} size={24} />
                </motion.div>
                {streak > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                   </span>
                )}
             </div>
             <div>
                <div className="text-4xl font-black tracking-tight">{streak} {streak === 1 ? 'Day' : 'Days'}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {streak === 0 ? "Start your practice streak today!" : streak < 3 ? "Keep the momentum going!" : "Amazing work! You're on fire!"}
                </p>
             </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Global comparison hidden per request */}
      {/* <Card className="relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Award size={120} strokeWidth={1} />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
             <div className={`p-3 rounded-2xl ${percentile > 50 ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted/10 text-muted-foreground'}`}>
                <Star className={percentile > 50 ? "fill-indigo-500" : ""} />
             </div>
             <div>
                <div className="text-4xl font-bold">Top {100 - percentile}%</div>
                <p className="text-sm text-muted-foreground">
                  You score better than {percentile}% of all users.
                </p>
             </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
