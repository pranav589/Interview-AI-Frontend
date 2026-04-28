'use client';

import { TranscriptMessage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Mic, MessageCircle } from 'lucide-react';

interface TranscriptViewerProps {
  transcript: TranscriptMessage[];
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Transcript</CardTitle>
        <CardDescription>
          Complete interview conversation with timestamps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-h-[500px] overflow-y-auto"
        >
          {transcript.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.speaker === 'ai' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${message.speaker === 'ai'
                      ? 'bg-primary'
                      : 'bg-secondary'
                    }`}
                >
                  {message.speaker === 'ai' ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                </motion.div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-semibold text-sm">
                    {message.speaker === 'ai' ? 'AI Interviewer' : 'You'}
                  </span>
                  {/* <span className="text-xs text-muted-foreground">
                    {Math.floor(message.timestamp / 60)}m {message.timestamp % 60}s
                  </span> */}
                </div>

                <motion.div
                  className={`p-4 rounded-lg ${message.speaker === 'ai'
                      ? 'bg-primary/10 text-foreground'
                      : 'bg-secondary/10 text-foreground'
                    }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.text}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
