'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageCircle, Mic } from 'lucide-react';

export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai' | 'system';
  text: string;
}

interface TranscriptionChatProps {
  messages: ChatMessage[];
  partialTranscript?: string;
  isTranscribing?: boolean;
}

export default function TranscriptionChat({
  messages,
  partialTranscript = '',
  isTranscribing = false,
}: TranscriptionChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, partialTranscript]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <Card className="flex-1 flex flex-col overflow-hidden  shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Live Transcription</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time conversation transcript
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{messages.filter(m => m.speaker !== 'system').length} exchanges</span>
            </div>
          </div>
        </CardHeader>

        <CardContent
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pt-4 pr-4 scroll-smooth"
        >
          {messages.length === 0 && !partialTranscript ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <p>Start speaking to begin the interview</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 p-1 pb-4"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.speaker === 'ai' ? 'justify-start' : message.speaker === 'user' ? 'justify-end' : 'justify-center'
                    } animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  {message.speaker === 'system' ? (
                    <div className="text-[10px] text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border italic my-1 uppercase tracking-wider font-medium">
                      {message.text}
                    </div>
                  ) : (
                    <div className="flex gap-3 max-w-[85%] group">
                      {message.speaker === 'ai' && (
                        <div className="flex-shrink-0 mt-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-primary shadow-lg shadow-primary/20"
                          >
                            <Mic className="w-4 h-4" />
                          </motion.div>
                        </div>
                      )}

                      <div className={`flex-1 min-w-0 ${message.speaker === 'user' ? 'text-right' : ''}`}>
                        <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 opacity-50 ${message.speaker === 'ai' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                          {message.speaker === 'ai' ? 'Interviewer' : 'You'}
                        </div>
                        <motion.div
                          className={`text-sm p-3 rounded-2xl break-words shadow-sm ${message.speaker === 'ai'
                            ? 'bg-muted border border-border text-foreground rounded-tl-none'
                            : 'bg-primary text-primary-foreground rounded-tr-none'
                            }`}
                        >
                          {message.text}
                        </motion.div>
                      </div>

                      {message.speaker === 'user' && (
                        <div className="flex-shrink-0 mt-1">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-primary/20 border border-primary/30"
                          >
                            <MessageCircle className="w-4 h-4 text-primary" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Partial transcript being spoken */}
              {(partialTranscript || isTranscribing) && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-1 duration-300">
                  <div className="max-w-[85%] p-3 rounded-2xl shadow-sm bg-primary/10 text-primary rounded-tr-none border border-primary/20 italic">
                    <div className="text-[10px] uppercase tracking-wider font-bold mb-1 opacity-50 flex items-center gap-1.5 justify-end">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                      Listening...
                    </div>
                    <div className="text-sm leading-relaxed text-right">
                      {partialTranscript || "..."}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
