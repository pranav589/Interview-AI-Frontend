'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye, Play, Sparkles, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface UnifiedActivityCardProps {
  item: any;
  type: 'ai' | 'human';
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const typeColors = {
  behavioral: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'system-design': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export default function UnifiedActivityCard({ item, type }: UnifiedActivityCardProps) {
  const isAI = type === 'ai';
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const title = isAI 
    ? (item.jobTitle ? `${item.jobTitle} Interview` : `${item.interviewType?.charAt(0).toUpperCase()}${item.interviewType?.slice(1)} Interview`)
    : `Peer Interview with ${item.role === 'Interviewer' ? item.candidateId?.name : item.interviewerId?.name}`;

  const subtitle = isAI
    ? `${item.company || "General Practice"} • AI Interviewer`
    : `Role: ${item.role} • Human Partner`;

  const date = isAI ? item.createdAt : item.startTime;
  const score = isAI ? item.score : (item.interviewerScore ? item.interviewerScore * 20 : null); // Normalize 0-5 to 0-100 for visual consistency

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden border-l-4 ${isAI ? 'border-l-primary' : 'border-l-blue-500'} hover:shadow-md transition-all group`}>
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {isAI ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-0.5">
                    <Sparkles className="w-3 h-3" />
                    AI Practice
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1.5 py-0.5">
                    <Users className="w-3 h-3" />
                    Peer Interview
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                   <Calendar className="w-3 h-3" />
                   {format(new Date(date), "MMM d, yyyy")}
                </span>
              </div>
              
              <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px] opacity-70">
                {subtitle}
              </p>
            </div>

            {score !== null && item.status === 'completed' && (
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0 bg-muted/30 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                <div className={`text-3xl font-black ${getScoreColor(score)}`}>
                  {score}
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Score</p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {isAI ? (
                <>
                  <Badge variant="outline" className={typeColors[item.interviewType as keyof typeof typeColors] || ''}>
                    {item.interviewType}
                  </Badge>
                  <Badge variant="outline" className={difficultyColors[item.difficultyLevel as keyof typeof difficultyColors] || ''}>
                    {item.difficultyLevel}
                  </Badge>
                </>
              ) : (
                <>
                  {item.interviewerId?.expertiseTags?.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="bg-muted text-muted-foreground border-transparent">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className={item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {item.status}
                  </Badge>
                </>
              )}
            </div>

            <div className="w-full sm:w-auto">
              <Link href={isAI ? `/interview/${item._id}` : `/interview/human/${item._id}/summary`}>
                <Button size="sm" variant={isAI ? "default" : "outline"} className={`w-full sm:w-auto gap-2 font-bold ${isAI ? 'shadow-lg shadow-primary/20' : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}>
                  {isAI ? <Eye className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {isAI ? 'View Analysis' : 'View Report'}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
