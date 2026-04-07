'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScoreHistory } from "@/hooks/use-interviews";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

export function ScoreTrendChart() {
  const { data: history, isLoading } = useScoreHistory();

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] animate-pulse bg-muted/20">
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="h-full w-full bg-muted/30 rounded" />
        </CardContent>
      </Card>
    );
  }

  const data = history || [];

  if (data.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Score Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-lg m-6 mt-0">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <p>Complete 2+ interviews to see your score trend</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item: { date: string; score: number; type: string }) => ({
    ...item,
    formattedDate: format(new Date(item.date), "MMM dd"),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <filter id="shadow" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="4" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  borderColor: 'var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--border)',
                }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="var(--primary)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                filter="url(#shadow)"
                dot={{ r: 5, fill: 'var(--card)', strokeWidth: 3, stroke: 'var(--primary)' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--primary)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
