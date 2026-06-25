'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageCircle, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai' | 'system';
  text: string;
  isLive?: boolean;
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

  // Group consecutive candidate turns to ensure only one bubble is shown per turn
  const mergedMessages: ChatMessage[] = [];
  for (const msg of messages) {
    const last = mergedMessages[mergedMessages.length - 1];
    if (last && last.speaker === msg.speaker && msg.speaker === 'user') {
      last.text = `${last.text} ${msg.text}`.trim();
    } else {
      mergedMessages.push({ ...msg });
    }
  }

  // Append active partial transcript to the last user message, or create a virtual one
  const displayMessages = [...mergedMessages];
  if (partialTranscript || isTranscribing) {
    const last = displayMessages[displayMessages.length - 1];
    const liveText = partialTranscript || '...';
    if (last && last.speaker === 'user') {
      displayMessages[displayMessages.length - 1] = {
        ...last,
        text: last.text ? `${last.text} ${liveText}` : liveText,
        isLive: true,
      };
    } else {
      displayMessages.push({
        id: `virtual-user`,
        speaker: 'user',
        text: liveText,
        isLive: true,
      });
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const hasExchanges = displayMessages.filter(m => m.speaker !== 'system').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      <Card className="flex-1 flex flex-col overflow-hidden shadow-none border-hairline bg-tile-1">
        <CardHeader className="pb-4 border-b border-hairline">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-tagline font-semibold tracking-apple-tight">Live Transcription</CardTitle>
              <CardDescription className="text-ink-muted-80">
                Real-time conversation transcript
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{hasExchanges} exchanges</span>
            </div>
          </div>
        </CardHeader>

        <CardContent
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 pt-4 pr-4 scroll-smooth"
          aria-live="polite"
          aria-atomic="false"
        >
          {displayMessages.length === 0 ? (
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
              {displayMessages.map((message) => (
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
                        <div className={`text-[10px] uppercase tracking-wider font-bold mb-1 opacity-50 ${message.speaker === 'ai' ? 'text-ink-muted-80' : 'text-primary'} flex items-center gap-1.5 ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {message.speaker === 'ai' ? 'Interviewer' : 'You'}
                          {message.isLive && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                          )}
                        </div>
                        <motion.div
                          className={`text-body text-sm! p-4 rounded-2xl break-words ${message.speaker === 'ai'
                            ? 'bg-pearl border border-hairline text-ink rounded-tl-none'
                            : 'bg-primary text-white rounded-tr-none'
                            } ${message.isLive ? 'italic bg-primary/95' : ''}`}
                        >
                          <div className={`prose prose-sm max-w-none ${message.speaker === 'ai'
                            ? 'text-ink dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:list-disc prose-ol:list-decimal pl-2'
                            : 'text-white prose-p:my-1 prose-headings:my-2 prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal pl-2'
                          }`}>
                            <ReactMarkdown>{message.text}</ReactMarkdown>
                          </div>
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
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
