'use client';

import { Feedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface FeedbackScoresProps {
  feedback: Feedback;
}

export default function FeedbackScores({ feedback }: FeedbackScoresProps) {
  const scores = [
    { label: 'Communication', value: feedback.communicationScore },
    { label: 'Technical Knowledge', value: feedback.technicalScore },
    { label: 'Confidence', value: feedback.confidenceScore },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    if (score >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
    if (score >= 60) return 'bg-orange-100 dark:bg-orange-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {scores.map((score, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{score.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className={`relative w-32 h-32 rounded-full ${getScoreBgColor(score.value)} flex items-center justify-center mb-4`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, type: 'spring' }}
                  className={`text-4xl font-bold bg-gradient-to-r ${getScoreColor(score.value)} bg-clip-text text-transparent`}
                >
                  {score.value}
                </motion.div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score.value}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className={`h-full bg-gradient-to-r ${getScoreColor(score.value)}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
