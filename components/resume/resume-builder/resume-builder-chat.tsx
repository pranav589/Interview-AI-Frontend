import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight,
  Send,
  X,
  User,
  Bot,
  FileText,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Briefcase,
  BookOpen,
  Hash,
  Sparkles,
  Award,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeProgressBar } from "../resume-progress-bar";
import {
  BuilderSession,
  ChatMessage,
  ResumeData,
  formatValue,
} from "./resume-builder-types";

export const STEP_LABELS: Record<string, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  review_ready: "Review Ready",
  editor: "Editor",
};

export const SECTION_ICONS: Record<string, React.ReactNode> = {
  personalInfo: <User className="h-3.5 w-3.5" />,
  summary: <FileText className="h-3.5 w-3.5" />,
  experience: <Briefcase className="h-3.5 w-3.5" />,
  education: <BookOpen className="h-3.5 w-3.5" />,
  skills: <Hash className="h-3.5 w-3.5" />,
  projects: <Sparkles className="h-3.5 w-3.5" />,
  certifications: <Award className="h-3.5 w-3.5" />,
  languages: <Languages className="h-3.5 w-3.5" />,
  awards: <Award className="h-3.5 w-3.5" />,
};

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-action-blue/50"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export function PickerEmpty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-hairline bg-canvas px-4 py-3 text-sm text-ink/40">{children}</div>;
}

export function ChatBubble({ message, index }: { message: ChatMessage; index?: number }) {
  return (
    <div className={cn("flex max-w-[86%] gap-3", message.role === "user" && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          message.role === "user"
            ? "bg-action-blue text-white"
            : "bg-gradient-to-br from-action-blue/10 to-action-blue/5 text-action-blue ring-1 ring-action-blue/20",
        )}
      >
        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div
        className={cn(
          "rounded-3xl px-6 py-4 text-base leading-relaxed",
          message.role === "user"
            ? "rounded-tr-none bg-action-blue text-white"
            : "rounded-tl-none border border-hairline bg-canvas-parchment text-ink",
        )}
      >
        <div className="prose prose-sm max-w-none text-inherit prose-p:my-0 prose-li:my-0.5">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function ReviewPanel({ session, isReviewReady, onContinue }: { session: BuilderSession; isReviewReady: boolean; onContinue: () => void }) {
  const sectionLabels: Array<[keyof ResumeData, string]> = [
    ["personalInfo", "Personal Info"],
    ["summary", "Summary"],
    ["experience", "Experience"],
    ["education", "Education"],
    ["skills", "Skills"],
    ["projects", "Projects"],
    ["certifications", "Certifications"],
    ["languages", "Languages"],
    ["awards", "Awards"],
  ];

  const ctaButton = (
    <Button
      className="h-10 w-full rounded-pill bg-action-blue text-white hover:bg-action-blue-hover"
      onClick={onContinue}
    >
      {isReviewReady ? "Continue to Editor" : "Skip to Editor"}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <aside className="flex h-full flex-col bg-canvas-parchment overflow-hidden text-left">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-hairline bg-canvas-parchment px-6 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-action-blue">Extracted Foundation</p>
            <h2 className="text-xl font-semibold tracking-tight text-ink">Review Sections</h2>
          </div>
          {isReviewReady && <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-action-blue" />}
        </div>
        {ctaButton}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Metadata badges */}
        {((session.intakeMetadata?.timelineGaps || []).length > 0 || (session.intakeMetadata?.weakBullets || []).length > 0) && (
          <div className="mb-5 space-y-2">
            {(session.intakeMetadata?.timelineGaps || []).slice(0, 2).map((gap) => (
              <div key={gap} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <div className="flex-1 min-w-0">
                  <span className="mr-2 inline-block rounded-full bg-amber-200 dark:bg-amber-800/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Gap</span>
                  <span className="text-xs">{gap}</span>
                </div>
              </div>
            ))}
            {(session.intakeMetadata?.weakBullets || []).slice(0, 2).map((bullet) => (
              <div key={bullet} className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40 px-3 py-2.5 text-sm text-blue-800 dark:text-blue-300">
                <span className="mt-0.5 shrink-0">🔵</span>
                <div className="flex-1 min-w-0">
                  <span className="mr-2 inline-block rounded-full bg-blue-200 dark:bg-blue-800/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Improve</span>
                  <span className="text-xs">{bullet}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section rows */}
        <div className="space-y-3">
          {sectionLabels.map(([key, label]) => {
            const lines = formatValue(session.resumeData?.[key]);
            const dotColor =
              lines.length === 0
                ? "bg-ink/15"
                : lines.length < 2 && key !== "summary" && key !== "personalInfo"
                ? "bg-amber-400"
                : "bg-emerald-500";
            return (
              <section key={key} className="rounded-lg border border-hairline bg-canvas p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-ink/40">{SECTION_ICONS[key as string]}</span>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45">{label}</h3>
                  </div>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />
                </div>
                {lines.length ? (
                  <ul className="space-y-1 text-sm leading-relaxed text-ink/65">
                    {lines.slice(0, 4).map((line) => (
                      <li key={line} className="truncate">{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ink/30">Not extracted yet.</p>
                )}
              </section>
            );
          })}
        </div>

        {/* Bottom CTA duplicate */}
        <div className="mt-6">{ctaButton}</div>
      </div>
    </aside>
  );
}

export function IntakeMode({
  session,
  messages,
  inputText,
  scrollRef,
  isReviewReady,
  isSending,
  onInputChange,
  onSend,
  onContinue,
}: {
  session: BuilderSession;
  messages: ChatMessage[];
  inputText: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isReviewReady: boolean;
  isSending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onContinue: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [inputText]);

  const stepLabel = STEP_LABELS[session.currentStep] || session.currentStep;

  return (
    <div className="flex h-[calc(100vh-52px)] flex-col bg-canvas overflow-hidden">
      {/* Progress bar is sticky inside this container */}
      <ResumeProgressBar completionMap={session.completionMap || {}} />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.65fr)]">
        {/* ── Chat column ── */}
        <main className="flex min-h-0 flex-col border-r border-hairline bg-canvas">
          {/* Thin step status bar */}
          <div className="flex shrink-0 items-center gap-2 border-b border-hairline bg-canvas-parchment px-6 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink/30">Step</span>
            <span className="rounded-pill bg-action-blue/10 px-2.5 py-0.5 text-xs font-semibold text-action-blue">
              {stepLabel}
            </span>
            {/* Mobile: review panel trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="ml-auto flex items-center gap-1.5 rounded-pill border border-hairline bg-canvas px-3 py-1 text-xs font-semibold text-ink/50 hover:text-ink lg:hidden"
            >
              <FileText className="h-3.5 w-3.5" />
              Review
            </button>
          </div>

          {/* Scrollable messages — takes all remaining space */}
          <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
            <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <ChatBubble message={message} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input tray — always pinned to bottom of the chat column */}
          <div className="shrink-0 border-t border-hairline bg-canvas px-6 py-4">
            {isSending && (
              <div className="mx-auto mb-3 flex max-w-3xl items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-action-blue/10 to-action-blue/5 ring-1 ring-action-blue/20">
                  <Bot className="h-4 w-4 text-action-blue" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-hairline bg-canvas-parchment px-4 py-2">
                  <ThinkingDots />
                </div>
              </div>
            )}

            {isReviewReady ? (
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-[20px] border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Intake complete — your resume foundation is ready.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 rounded-pill bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  onClick={onContinue}
                >
                  Continue to Editor
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[28px] border border-hairline bg-canvas p-3 shadow-sm">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        onSend();
                      }
                    }}
                    disabled={isSending}
                    placeholder="Answer the AI question..."
                    rows={1}
                    style={{ minHeight: "48px", maxHeight: "160px" }}
                    className="flex-1 resize-none overflow-y-auto bg-transparent px-4 py-3 text-base text-ink outline-none placeholder:text-ink/25"
                  />
                  <Button
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-2xl bg-action-blue text-white hover:bg-action-blue-hover"
                    onClick={onSend}
                    disabled={!inputText.trim() || isSending}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <p className="mx-auto mt-2 max-w-3xl px-4 text-xs text-ink/30">
                  Press{" "}
                  <kbd className="rounded border border-hairline bg-canvas-parchment px-1 py-0.5 font-mono text-[10px]">
                    Enter
                  </kbd>{" "}
                  to send &nbsp;·&nbsp;{" "}
                  <kbd className="rounded border border-hairline bg-canvas-parchment px-1 py-0.5 font-mono text-[10px]">
                    Shift+Enter
                  </kbd>{" "}
                  for a new line
                </p>
              </>
            )}
          </div>
        </main>

        {/* ── Review panel — desktop sidebar ── */}
        <div className="hidden lg:flex lg:flex-col lg:overflow-hidden">
          <ReviewPanel session={session} isReviewReady={isReviewReady} onContinue={onContinue} />
        </div>
      </div>

      {/* ── Review panel — mobile bottom drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-background shadow-2xl lg:hidden text-left"
            >
              {/* Drag handle + header */}
              <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="mx-auto h-1 w-10 rounded-full bg-ink/15 absolute top-2 left-1/2 -translate-x-1/2" />
                  <p className="text-sm font-semibold text-ink">Resume Foundation</p>
                  {isReviewReady && <CheckCircle2 className="h-4 w-4 text-action-blue" />}
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-ink/30 hover:bg-canvas hover:text-ink"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                <ReviewPanel
                  session={session}
                  isReviewReady={isReviewReady}
                  onContinue={() => {
                    setDrawerOpen(false);
                    onContinue();
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
