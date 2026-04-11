'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";

interface SkillRadarChartProps {
  data: {
    communication: number;
    technical: number;
    confidence: number;
  };
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const chartData = [
    { subject: 'Communication', A: data.communication, fullMark: 100 },
    { subject: 'Technical', A: data.technical, fullMark: 100 },
    { subject: 'Confidence', A: data.confidence, fullMark: 100 },
  ];

  const hasData = data.communication > 0 || data.technical > 0 || data.confidence > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skill Breakdown</CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Exclusive</span>
          </div>
        </div>
        <CardDescription>Deep analysis from AI-powered practice sessions</CardDescription>
      </CardHeader>
      <CardContent className="pb-0 px-2 flex items-center justify-center min-h-[300px]">
        {hasData ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tick={false} 
                />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="var(--primary)"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-[300px] w-full border-2 border-dashed border-border/50 rounded-lg">
            <p>Complete an interview to see skill analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
