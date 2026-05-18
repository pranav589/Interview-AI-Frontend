"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bot,
  CheckCircle2,
  Database,
  Download,
  FileDown,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import { cn } from "@/lib/utils";
import {
  useCompleteBuilderSession,
  useDownloadTemplate,
  useResumes,
  useRunBuilderCommand,
  useSendBuilderMessage,
  useStartBuilder,
  useUpdateBuilderSession,
} from "@/hooks/use-resume";
import { ResumeProgressBar } from "./resume-progress-bar";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type PendingQuestion = { id: string; category: string; question: string; resolved?: boolean };
type SaveStatus = "saved" | "unsaved" | "saving" | "error";
type BuilderCommand = "bullet" | "shorten" | "expand" | "quantify" | "tone" | "keywords";

type CommandPayload = {
  command: BuilderCommand;
  fieldPath: string;
  selectedText?: string;
  fieldText: string;
  targetContext?: string;
};

type BuilderSession = {
  _id: string;
  name: string;
  templateId?: string;
  status?: "in-progress" | "completed";
  resumeData: ResumeData;
  chatHistory: ChatMessage[];
  completionMap?: Record<string, boolean>;
  currentStep: string;
  intakeMetadata?: {
    detectedExperienceYears?: number;
    timelineGaps?: string[];
    missingFields?: string[];
    weakBullets?: string[];
    pendingQuestions?: PendingQuestion[];
  };
};

type ExperienceItem = {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

type EducationItem = {
  degree: string;
  school: string;
  location?: string;
  gradDate?: string;
  details?: string[];
};

type ProjectItem = {
  name: string;
  description?: string;
  bullets?: string[];
};

type CertificationItem = {
  name: string;
  issuer?: string;
  date?: string;
};

type ResumeData = {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: string[];
  awards: string[];
  sectionOrder?: string[];
};

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const emptyResumeData = (): ResumeData => ({
  personalInfo: { links: [] },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  sectionOrder: ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"],
});

const normalizeDraft = (raw?: Partial<ResumeData> | null): ResumeData => ({
  ...emptyResumeData(),
  ...raw,
  personalInfo: { links: [], ...(raw?.personalInfo || {}) },
  experience: Array.isArray(raw?.experience) ? raw.experience : [],
  education: Array.isArray(raw?.education) ? raw.education : [],
  skills: Array.isArray(raw?.skills) ? raw.skills : [],
  projects: Array.isArray(raw?.projects) ? raw.projects : [],
  certifications: Array.isArray(raw?.certifications) ? raw.certifications : [],
  languages: Array.isArray(raw?.languages) ? raw.languages : [],
  awards: Array.isArray(raw?.awards) ? raw.awards : [],
  sectionOrder: Array.isArray(raw?.sectionOrder) 
    ? raw.sectionOrder 
    : ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"],
});

const formatValue = (value: any): string[] => {
  if (!value) return [];
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.role || item?.company) {
          return `${item.role || "Role"}${item.company ? ` at ${item.company}` : ""}${item.startDate || item.endDate ? ` (${[item.startDate, item.endDate].filter(Boolean).join(" - ")})` : ""}`;
        }
        if (item?.degree || item?.school) return `${item.degree || "Degree"}${item.school ? `, ${item.school}` : ""}`;
        if (item?.name) return item.name;
        return JSON.stringify(item);
      })
      .filter(Boolean);
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, entry]) => Boolean(entry))
      .map(([key, entry]) => `${key}: ${Array.isArray(entry) ? entry.join(", ") : String(entry)}`);
  }
  return [String(value)];
};

const ghostSuggestion = (text: string, kind: "summary" | "bullet" | "project") => {
  const value = text.trim();
  if (!value) return null;
  if (kind !== "summary" && value.split(/\s+/).length < 8) {
    return { label: "Clarify impact", insert: " - clarify the outcome and business impact." };
  }
  if (!/\d/.test(value)) {
    return { label: "Add metric", insert: " [add metric: increased/decreased X by Y%]" };
  }
  if (/^(worked|helped|made|did|responsible)/i.test(value)) {
    return { label: "Start with action verb", insert: " Rephrase with: Built, Improved, Led, Optimized, Delivered." };
  }
  if (kind === "summary" && value.length < 120) {
    return { label: "Add positioning", insert: " Add target role, core stack, and strongest outcome." };
  }
  return null;
};

export function ResumeBuilderContent() {
  const router = useRouter();
  const { isFeatureEnabled, isLoading: isFlagsLoading } = useFeatureFlags();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [session, setSession] = useState<BuilderSession | null>(null);
  const [draft, setDraft] = useState<ResumeData>(emptyResumeData());
  const [mode, setMode] = useState<"intake" | "editor">("intake");
  const [inputText, setInputText] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [activeGhostField, setActiveGhostField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSavedJsonRef = useRef("");
  const hasMountedEditorRef = useRef(false);

  const startMutation = useStartBuilder();
  const sendMutation = useSendBuilderMessage();
  const updateMutation = useUpdateBuilderSession();
  const completeMutation = useCompleteBuilderSession();
  const downloadMutation = useDownloadTemplate();
  const commandMutation = useRunBuilderCommand();
  const resumesQuery = useResumes();

  const messages = session?.chatHistory || [];
  const isReviewReady = session?.currentStep === "review_ready";
  const isCompleted = session?.status === "completed" || session?.currentStep === "completed";
  const canDownload = Boolean(session?._id && isCompleted && saveStatus === "saved");

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length, sendMutation.isPending]);

  useEffect(() => {
    if (!session || mode !== "editor") return;
    const nextDraft = normalizeDraft(session.resumeData);
    setDraft(nextDraft);
    lastSavedJsonRef.current = JSON.stringify(nextDraft);
    hasMountedEditorRef.current = false;
    setSaveStatus("saved");
  }, [mode, session?._id]);

  useEffect(() => {
    if (!session?._id || mode !== "editor") return;

    const draftJson = JSON.stringify(draft);
    if (!hasMountedEditorRef.current) {
      hasMountedEditorRef.current = true;
      lastSavedJsonRef.current = draftJson;
      return;
    }
    if (draftJson === lastSavedJsonRef.current) return;

    setSaveStatus("unsaved");
    const timeout = window.setTimeout(() => {
      setSaveStatus("saving");
      updateMutation.mutate(
        { sessionId: session._id, resumeData: draft, currentStep: "editor" },
        {
          onSuccess: (res: any) => {
            lastSavedJsonRef.current = JSON.stringify(draft);
            setSession(res.data);
            setSaveStatus("saved");
          },
          onError: () => setSaveStatus("error"),
        },
      );
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [draft, mode, session?._id]);

  if (!isFlagsLoading && !isFeatureEnabled("resume_builder_enabled")) {
    return <FeatureUnavailable onBack={() => router.push("/resume")} />;
  }

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    setSelectedFile(file);
    setSelectedResumeId(null);
  };

  const handleStart = () => {
    if (!selectedFile && !selectedResumeId) {
      toast.error("Choose a saved resume or upload a file first.");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
      formData.append("name", selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
    if (selectedResumeId) formData.append("resumeId", selectedResumeId);

    startMutation.mutate(formData, {
      onSuccess: (res: any) => {
        setSession(res.data);
        toast.success("Resume intake started.");
      },
      onError: (error: any) => toast.error(error?.message || "Failed to start intake."),
    });
  };

  const handleSend = () => {
    const message = inputText.trim();
    if (!message || !session?._id || sendMutation.isPending || isReviewReady) return;

    setInputText("");
    setSession((current) =>
      current ? { ...current, chatHistory: [...current.chatHistory, { role: "user", content: message }] } : current,
    );

    sendMutation.mutate(
      { sessionId: session._id, message },
      {
        onSuccess: (res: any) => {
          setSession(res.data);
          if (res.data?.currentStep === "review_ready") toast.success("Your resume foundation is ready to review.");
        },
        onError: (error: any) => toast.error(error?.message || "Failed to send your answer."),
      },
    );
  };

  const enterEditor = () => {
    if (!session?._id) return;
    const nextDraft = normalizeDraft(session.resumeData);
    setDraft(nextDraft);
    setMode("editor");
    updateMutation.mutate(
      { sessionId: session._id, currentStep: "editor", resumeData: nextDraft },
      { onSuccess: (res: any) => setSession(res.data) },
    );
  };

  const handleFinish = async () => {
    if (!session?._id) return;
    try {
      setSaveStatus("saving");
      const updated: any = await updateMutation.mutateAsync({
        sessionId: session._id,
        resumeData: draft,
        currentStep: "editor",
      });
      const completed: any = await completeMutation.mutateAsync(session._id);
      setSession(completed.data || updated.data);
      lastSavedJsonRef.current = JSON.stringify(draft);
      setSaveStatus("saved");
      toast.success("Resume editor complete. Exports are ready.");
    } catch (error: any) {
      setSaveStatus("error");
      toast.error(error?.message || "Could not finish the resume.");
    }
  };

  const handleDownload = (format: "pdf" | "docx") => {
    if (!session?._id || !canDownload) return;
    downloadMutation.mutate({ sessionId: session._id, templateId: session.templateId || "modern", format });
  };

  const updateDraft = (updater: (current: ResumeData) => ResumeData) => {
    setDraft((current) => normalizeDraft(updater(normalizeDraft(current))));
  };

  const runCommand = async (payload: CommandPayload) => {
    if (!session?._id) throw new Error("Builder session is not ready");
    const response: any = await commandMutation.mutateAsync({
      sessionId: session._id,
      ...payload,
      resumeData: draft,
    });
    return response.data as { replacementText: string; explanation?: string };
  };

  if (!session) {
    return (
      <StartScreen
        selectedFile={selectedFile}
        selectedResumeId={selectedResumeId}
        fileInputRef={fileInputRef}
        resumes={resumesQuery.data || []}
        isLoadingResumes={resumesQuery.isLoading}
        isStarting={startMutation.isPending}
        onFileChange={handleFileChange}
        onPickResume={(resumeId) => {
          setSelectedResumeId(resumeId);
          setSelectedFile(null);
        }}
        onStart={handleStart}
      />
    );
  }

  if (mode === "editor") {
    return (
      <EditorMode
        draft={draft}
        session={session}
        saveStatus={saveStatus}
        canDownload={canDownload}
        activeGhostField={activeGhostField}
        isFinishing={completeMutation.isPending || updateMutation.isPending}
        isDownloading={downloadMutation.isPending}
        isRunningCommand={commandMutation.isPending}
        onDraftChange={updateDraft}
        onBack={() => setMode("intake")}
        onFinish={handleFinish}
        onDownload={handleDownload}
        onGhostFocus={setActiveGhostField}
        onRunCommand={runCommand}
      />
    );
  }

  return (
    <IntakeMode
      session={session}
      messages={messages}
      inputText={inputText}
      scrollRef={scrollRef}
      isReviewReady={isReviewReady}
      isSending={sendMutation.isPending}
      onInputChange={setInputText}
      onSend={handleSend}
      onContinue={enterEditor}
    />
  );
}

function FeatureUnavailable({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-ink/5">
        <ShieldCheck className="h-10 w-10 text-ink/20" />
      </div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-ink">Feature Unavailable</h1>
      <p className="mb-10 max-w-md text-lg leading-relaxed text-ink/40">The AI Resume Builder is currently under maintenance.</p>
      <Button variant="outline" className="h-12 rounded-pill border-hairline px-8" onClick={onBack}>
        Back to Career Suite
      </Button>
    </div>
  );
}

function StartScreen({
  selectedFile,
  selectedResumeId,
  fileInputRef,
  resumes,
  isLoadingResumes,
  isStarting,
  onFileChange,
  onPickResume,
  onStart,
}: {
  selectedFile: File | null;
  selectedResumeId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  resumes: Array<{ _id: string; name: string; createdAt?: string }>;
  isLoadingResumes: boolean;
  isStarting: boolean;
  onFileChange: (file?: File) => void;
  onPickResume: (resumeId: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="w-full bg-canvas">
      {/* SECTION 1: EDITORIAL HERO (Pure White) */}
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 md:py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Creation Engine</span>
              </div>
              
              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Build your story. <br />
                <span className="text-ink/40">From scratch to offer.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-6 md:mb-12">
                Start with a saved resume or upload a LinkedIn export. The AI will extract the structure, spot gaps, and ask the next best question.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="rounded-pill w-full md:w-auto px-10 h-14 text-white text-lg font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
                  onClick={() => document.getElementById('builder-selection')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <MessageSquare className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Start Building
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-canvas-parchment border border-hairline group shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Image 
              src="/resume-builder-hero.png" 
              alt="Resume Builder Interface" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: SELECTION */}
      <section id="builder-selection" className="bg-canvas-parchment py-12 md:py-24 border-b border-hairline">
        <div className="mx-auto px-6 lg:px-12">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-ink leading-tight mb-4">
                Select foundation material.
              </h2>
              <p className="text-lg text-ink/40 leading-relaxed">
                Choose a version from your vault or upload a new PDF/DOCX to begin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Card */}
            <label 
              onDrop={(event) => {
                event.preventDefault();
                onFileChange(event.dataTransfer.files?.[0]);
              }}
              onDragOver={(event) => event.preventDefault()}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 min-h-[160px] ${
                selectedFile 
                ? "border-action-blue bg-white shadow-xl shadow-action-blue/5" 
                : "border-hairline bg-white/50 hover:border-action-blue/50 hover:bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(event) => onFileChange(event.target.files?.[0])}
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 ${
                selectedFile ? "bg-action-blue text-white" : "bg-action-blue/5 text-action-blue"
              }`}>
                {selectedFile ? <FileText className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              <p className="text-sm font-semibold text-ink text-center line-clamp-2">
                {selectedFile ? selectedFile.name : "Upload PDF/DOCX"}
              </p>
              {selectedFile && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-4 h-4 text-action-blue" />
                </div>
              )}
            </label>

            {/* Resume Cards */}
            {!isLoadingResumes && resumes.map((resume, index) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                onClick={() => onPickResume(resume._id)}
                className={`group relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] ${
                  selectedResumeId === resume._id 
                  ? "border-action-blue bg-white shadow-xl shadow-action-blue/5" 
                  : "border-hairline bg-white/50 hover:border-action-blue/30 hover:bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                      selectedResumeId === resume._id ? "bg-action-blue text-white" : "bg-action-blue/5 text-action-blue"
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    {selectedResumeId === resume._id && (
                      <CheckCircle2 className="w-4 h-4 text-action-blue" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-tight mb-1">
                    {resume.name}
                  </h3>
                  <p className="text-[10px] text-ink/30 font-medium">
                    {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : "Saved resume"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {isLoadingResumes && (
            <div className="flex justify-center mt-8">
              <Loader2 className="w-6 h-6 animate-spin text-action-blue" />
            </div>
          )}

          <div className="mt-16 flex justify-center">
            <Button
              size="lg"
              disabled={(!selectedResumeId && !selectedFile) || isStarting}
              onClick={onStart}
              className="rounded-pill px-12 py-8 text-white text-xl font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-action-blue/20"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PickerEmpty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-hairline bg-canvas px-4 py-3 text-sm text-ink/40">{children}</div>;
}

function IntakeMode({
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
  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col bg-canvas">
      <ResumeProgressBar completionMap={session.completionMap || {}} />
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.65fr)]">
        <main className="flex min-h-[640px] flex-col border-r border-hairline bg-canvas">
          <ScrollArea ref={scrollRef} className="flex-1">
            <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <ChatBubble message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSending && (
                <div className="flex items-center gap-3 text-sm font-medium text-ink/40">
                  <Loader2 className="h-4 w-4 animate-spin text-action-blue" />
                  Updating your resume foundation...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-hairline bg-canvas px-6 py-5">
            <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[28px] border border-hairline bg-white p-3 shadow-sm">
              <textarea
                value={inputText}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onSend();
                  }
                }}
                disabled={isSending || isReviewReady}
                placeholder={isReviewReady ? "Phase 1 intake complete" : "Answer the AI question..."}
                rows={1}
                className="min-h-12 max-h-40 flex-1 resize-none bg-transparent px-4 py-3 text-base text-ink outline-none placeholder:text-ink/25"
              />
              <Button size="icon" className="h-12 w-12 rounded-2xl bg-action-blue text-white hover:bg-action-blue-hover" onClick={onSend} disabled={!inputText.trim() || isSending || isReviewReady}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </main>
        <ReviewPanel session={session} isReviewReady={isReviewReady} onContinue={onContinue} />
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={cn("flex max-w-[86%] gap-3", message.role === "user" && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          message.role === "user" ? "bg-action-blue text-white" : "border border-hairline bg-canvas-parchment text-action-blue",
        )}
      >
        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div
        className={cn(
          "rounded-3xl px-6 py-4 text-base leading-relaxed",
          message.role === "user" ? "rounded-tr-none bg-action-blue text-white" : "rounded-tl-none border border-hairline bg-canvas-parchment text-ink",
        )}
      >
        <div className="prose prose-sm max-w-none text-inherit prose-p:my-1 prose-li:my-1">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({ session, isReviewReady, onContinue }: { session: BuilderSession; isReviewReady: boolean; onContinue: () => void }) {
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

  return (
    <aside className="bg-canvas-parchment px-6 py-8 lg:overflow-y-auto">
      <div className="mb-6 flex items-start justify-between gap-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-action-blue">Extracted Foundation</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Review Sections</h2>
        </div>
        {isReviewReady && <CheckCircle2 className="mt-1 h-6 w-6 text-action-blue" />}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-3 text-sm">
        {(session.intakeMetadata?.timelineGaps || []).slice(0, 2).map((gap) => (
          <div key={gap} className="rounded-lg border border-hairline bg-canvas px-4 py-3 text-ink/55">{gap}</div>
        ))}
        {(session.intakeMetadata?.weakBullets || []).slice(0, 2).map((bullet) => (
          <div key={bullet} className="rounded-lg border border-hairline bg-canvas px-4 py-3 text-ink/55">{bullet}</div>
        ))}
      </div>
      <div className="space-y-4">
        {sectionLabels.map(([key, label]) => {
          const lines = formatValue(session.resumeData?.[key]);
          return (
            <section key={key} className="rounded-lg border border-hairline bg-canvas p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/45">{label}</h3>
                <span className={cn("h-2 w-2 rounded-full", lines.length ? "bg-action-blue" : "bg-ink/15")} />
              </div>
              {lines.length ? (
                <ul className="space-y-2 text-sm leading-relaxed text-ink/65">
                  {lines.slice(0, 5).map((line) => <li key={line}>{line}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-ink/30">Not extracted yet.</p>
              )}
            </section>
          );
        })}
      </div>
      <Button className="mt-6 h-12 w-full rounded-pill bg-action-blue text-white hover:bg-action-blue-hover" onClick={onContinue}>
        {isReviewReady ? "Continue to Editor" : "Skip to Editor"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </aside>
  );
}

function EditorMode({
  draft,
  session,
  saveStatus,
  canDownload,
  activeGhostField,
  isFinishing,
  isDownloading,
  isRunningCommand,
  onDraftChange,
  onBack,
  onFinish,
  onDownload,
  onGhostFocus,
  onRunCommand,
}: {
  draft: ResumeData;
  session: BuilderSession;
  saveStatus: SaveStatus;
  canDownload: boolean;
  activeGhostField: string | null;
  isFinishing: boolean;
  isDownloading: boolean;
  isRunningCommand: boolean;
  onDraftChange: (updater: (current: ResumeData) => ResumeData) => void;
  onBack: () => void;
  onFinish: () => void;
  onDownload: (format: "pdf" | "docx") => void;
  onGhostFocus: (field: string | null) => void;
  onRunCommand: (payload: CommandPayload) => Promise<{ replacementText: string; explanation?: string }>;
}) {
  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col bg-canvas">
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-canvas/95 px-6 py-4 backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-action-blue">Phase 2 Editor</p>
          <h1 className="text-xl font-semibold text-ink">{session.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaveState status={saveStatus} />
          <Button variant="outline" className="rounded-pill border-hairline" onClick={onBack}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Back to Intake
          </Button>
          <Button className="rounded-pill bg-action-blue text-white hover:bg-action-blue-hover" onClick={onFinish} disabled={isFinishing}>
            {isFinishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Finish
          </Button>
          <Button variant="outline" className="rounded-pill border-hairline" onClick={() => onDownload("pdf")} disabled={!canDownload || isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" className="rounded-pill border-hairline" onClick={() => onDownload("docx")} disabled={!canDownload || isDownloading}>
            <FileDown className="mr-2 h-4 w-4" />
            DOCX
          </Button>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(420px,0.9fr)_minmax(420px,0.75fr)]">
        <ScrollArea className="h-[calc(100vh-133px)] border-r border-hairline bg-canvas">
          <ResumeForm
            draft={draft}
            activeGhostField={activeGhostField}
            isRunningCommand={isRunningCommand}
            onDraftChange={onDraftChange}
            onGhostFocus={onGhostFocus}
            onRunCommand={onRunCommand}
          />
        </ScrollArea>
        <ScrollArea className="h-[calc(100vh-133px)] bg-canvas-parchment">
          <AtsPreview resume={draft} />
        </ScrollArea>
      </div>
    </div>
  );
}

function SaveState({ status }: { status: SaveStatus }) {
  const labels = {
    saved: "Saved",
    unsaved: "Unsaved changes",
    saving: "Saving...",
    error: "Save failed",
  };
  return (
    <div className={cn("flex items-center gap-2 rounded-pill border px-3 py-2 text-xs font-semibold", status === "error" ? "border-red-200 text-red-600" : "border-hairline text-ink/45")}>
      {status === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      {labels[status]}
    </div>
  );
}

function ResumeForm({
  draft,
  activeGhostField,
  isRunningCommand,
  onDraftChange,
  onGhostFocus,
  onRunCommand,
}: {
  draft: ResumeData;
  activeGhostField: string | null;
  isRunningCommand: boolean;
  onDraftChange: (updater: (current: ResumeData) => ResumeData) => void;
  onGhostFocus: (field: string | null) => void;
  onRunCommand: (payload: CommandPayload) => Promise<{ replacementText: string; explanation?: string }>;
}) {
  const updatePersonal = (key: keyof ResumeData["personalInfo"], value: string) => {
    onDraftChange((current) => ({ ...current, personalInfo: { ...current.personalInfo, [key]: value } }));
  };

  const sectionOrder = draft.sectionOrder || ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"];

  const moveSection = (index: number, direction: -1 | 1) => {
    onDraftChange((current) => {
      const order = [...(current.sectionOrder || ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"])];
      const target = index + direction;
      if (target < 0 || target >= order.length) return current;
      [order[index], order[target]] = [order[target], order[index]];
      return { ...current, sectionOrder: order };
    });
  };

  const renderSection = (sectionId: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;
    const onMoveUp = () => moveSection(index, -1);
    const onMoveDown = () => moveSection(index, 1);

    switch (sectionId) {
      case "summary":
        return (
          <EditorSection
            key="summary"
            title="Summary"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <GhostTextarea
              id="summary"
              kind="summary"
              value={draft.summary || ""}
              fieldPath="summary"
              activeGhostField={activeGhostField}
              isRunningCommand={isRunningCommand}
              onFocus={onGhostFocus}
              onChange={(value) => onDraftChange((current) => ({ ...current, summary: value }))}
              onRunCommand={onRunCommand}
            />
          </EditorSection>
        );
      case "experience":
        return (
          <ArrayEditor
            key="experience"
            title="Experience"
            items={draft.experience}
            emptyItem={() => ({ role: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] })}
            onChange={(experience) => onDraftChange((current) => ({ ...current, experience }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, idx, update) => (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Role" value={item.role || ""} onChange={(value) => update({ ...item, role: value })} />
                  <Field label="Company" value={item.company || ""} onChange={(value) => update({ ...item, company: value })} />
                  <Field label="Location" value={item.location || ""} onChange={(value) => update({ ...item, location: value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start" value={item.startDate || ""} onChange={(value) => update({ ...item, startDate: value })} />
                    <Field label="End" value={item.endDate || ""} onChange={(value) => update({ ...item, endDate: value })} />
                  </div>
                </div>
                <StringListEditor
                  title="Bullets"
                  items={item.bullets || []}
                  placeholder="Improved page speed from 60 to 90+..."
                  multiline
                  ghostKind="bullet"
                  activeGhostField={activeGhostField}
                  ghostPrefix={`experience-${idx}-bullet`}
                  fieldPathPrefix={`experience.${idx}.bullets`}
                  isRunningCommand={isRunningCommand}
                  onGhostFocus={onGhostFocus}
                  onRunCommand={onRunCommand}
                  onChange={(bullets) => update({ ...item, bullets })}
                />
              </div>
            )}
          />
        );
      case "education":
        return (
          <ArrayEditor
            key="education"
            title="Education"
            items={draft.education}
            emptyItem={() => ({ degree: "", school: "", location: "", gradDate: "", details: [] })}
            onChange={(education) => onDraftChange((current) => ({ ...current, education }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, _idx, update) => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Degree" value={item.degree || ""} onChange={(value) => update({ ...item, degree: value })} />
                <Field label="School" value={item.school || ""} onChange={(value) => update({ ...item, school: value })} />
                <Field label="Location" value={item.location || ""} onChange={(value) => update({ ...item, location: value })} />
                <Field label="Graduation" value={item.gradDate || ""} onChange={(value) => update({ ...item, gradDate: value })} />
              </div>
            )}
          />
        );
      case "skills":
        return (
          <EditorSection
            key="skills"
            title="Skills"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.skills}
              placeholder="React"
              onChange={(skills) => onDraftChange((current) => ({ ...current, skills }))}
              wrapped
            />
          </EditorSection>
        );
      case "projects":
        return (
          <ArrayEditor
            key="projects"
            title="Projects"
            items={draft.projects}
            emptyItem={() => ({ name: "", description: "", bullets: [""] })}
            onChange={(projects) => onDraftChange((current) => ({ ...current, projects }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, idx, update) => (
              <div className="space-y-4">
                <Field label="Project Name" value={item.name || ""} onChange={(value) => update({ ...item, name: value })} />
                <GhostTextarea
                  id={`project-${idx}-description`}
                  kind="project"
                  value={item.description || ""}
                  fieldPath={`projects.${idx}.description`}
                  activeGhostField={activeGhostField}
                  isRunningCommand={isRunningCommand}
                  onFocus={onGhostFocus}
                  onChange={(value) => update({ ...item, description: value })}
                  onRunCommand={onRunCommand}
                />
                <StringListEditor
                  title="Project Bullets"
                  items={item.bullets || []}
                  placeholder="Built a low-latency voice interviewer..."
                  multiline
                  ghostKind="bullet"
                  activeGhostField={activeGhostField}
                  ghostPrefix={`project-${idx}-bullet`}
                  fieldPathPrefix={`projects.${idx}.bullets`}
                  isRunningCommand={isRunningCommand}
                  onGhostFocus={onGhostFocus}
                  onRunCommand={onRunCommand}
                  onChange={(bullets) => update({ ...item, bullets })}
                />
              </div>
            )}
          />
        );
      case "certifications":
        return (
          <ArrayEditor
            key="certifications"
            title="Certifications"
            items={draft.certifications}
            emptyItem={() => ({ name: "", issuer: "", date: "" })}
            onChange={(certifications) => onDraftChange((current) => ({ ...current, certifications }))}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            renderItem={(item, _idx, update) => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Name" value={item.name || ""} onChange={(value) => update({ ...item, name: value })} />
                <Field label="Issuer" value={item.issuer || ""} onChange={(value) => update({ ...item, issuer: value })} />
                <Field label="Date" value={item.date || ""} onChange={(value) => update({ ...item, date: value })} />
              </div>
            )}
          />
        );
      case "languages":
        return (
          <EditorSection
            key="languages"
            title="Languages"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.languages}
              placeholder="English"
              onChange={(languages) => onDraftChange((current) => ({ ...current, languages }))}
              wrapped
            />
          </EditorSection>
        );
      case "awards":
        return (
          <EditorSection
            key="awards"
            title="Awards"
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
          >
            <StringListEditor
              title=""
              items={draft.awards}
              placeholder="Hackathon Winner"
              onChange={(awards) => onDraftChange((current) => ({ ...current, awards }))}
            />
          </EditorSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <EditorSection title="Personal Info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Name" value={draft.personalInfo.name || ""} onChange={(value) => updatePersonal("name", value)} />
          <Field label="Email" value={draft.personalInfo.email || ""} onChange={(value) => updatePersonal("email", value)} />
          <Field label="Phone" value={draft.personalInfo.phone || ""} onChange={(value) => updatePersonal("phone", value)} />
          <Field label="Location" value={draft.personalInfo.location || ""} onChange={(value) => updatePersonal("location", value)} />
        </div>
        <StringListEditor
          title="Links"
          items={draft.personalInfo.links || []}
          placeholder="https://github.com/username"
          onChange={(links) => onDraftChange((current) => ({ ...current, personalInfo: { ...current.personalInfo, links } }))}
        />
      </EditorSection>

      {sectionOrder.map((sectionId, idx) => renderSection(sectionId, idx))}
    </div>
  );
}

function EditorSection({
  title,
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  title: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  return (
    <section className="rounded-lg border border-hairline bg-canvas-parchment p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center gap-1">
            <IconButton label="Move up" onClick={onMoveUp!} disabled={!canMoveUp}>
              <ArrowUp className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton label="Move down" onClick={onMoveDown!} disabled={!canMoveDown}>
              <ArrowDown className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-hairline bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-action-blue/40"
      />
    </label>
  );
}

function GhostTextarea({
  id,
  kind,
  value,
  fieldPath,
  activeGhostField,
  isRunningCommand,
  onFocus,
  onChange,
  onRunCommand,
}: {
  id: string;
  kind: "summary" | "bullet" | "project";
  value: string;
  fieldPath: string;
  activeGhostField: string | null;
  isRunningCommand: boolean;
  onFocus: (id: string | null) => void;
  onChange: (value: string) => void;
  onRunCommand: (payload: CommandPayload) => Promise<{ replacementText: string; explanation?: string }>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [keywordTarget, setKeywordTarget] = useState("");
  const [pendingKeyword, setPendingKeyword] = useState(false);
  const [undoValue, setUndoValue] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const suggestion = ghostSuggestion(value, kind);
  const showGhost = activeGhostField === id && suggestion;

  const captureSelection = () => {
    const element = textareaRef.current;
    if (!element) return;
    const { selectionStart, selectionEnd } = element;
    if (selectionEnd > selectionStart) {
      setSelection({ start: selectionStart, end: selectionEnd });
      setCommandOpen(true);
    }
  };

  const updateValue = (nextValue: string) => {
    onChange(nextValue);
    if (nextValue.endsWith("/")) {
      setSelection({ start: nextValue.length - 1, end: nextValue.length });
      setCommandOpen(true);
    }
  };

  const applyCommand = async (command: BuilderCommand, targetContext?: string) => {
    const range = selection;
    const selectedText = range && range.end > range.start ? value.slice(range.start, range.end) : "";
    const isSlashTrigger = selectedText === "/";
    const commandFieldText = isSlashTrigger && range ? `${value.slice(0, range.start)}${value.slice(range.end)}` : value;
    try {
      setCommandError(null);
      const result = await onRunCommand({
        command,
        fieldPath,
        selectedText: isSlashTrigger ? "" : selectedText,
        fieldText: commandFieldText,
        targetContext,
      });
      const replacement = result.replacementText.trim();
      const nextValue = isSlashTrigger
        ? replacement
        : range
        ? `${value.slice(0, range.start)}${replacement}${value.slice(range.end)}`
        : replacement;
      setUndoValue(value);
      onChange(nextValue);
      setCommandOpen(false);
      setPendingKeyword(false);
      setKeywordTarget("");
      window.setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (error: any) {
      setCommandError(error?.message || "Command failed");
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onFocus={() => onFocus(id)}
        onBlur={() => window.setTimeout(() => onFocus(null), 150)}
        onSelect={captureSelection}
        onKeyUp={captureSelection}
        onChange={(event) => updateValue(event.target.value)}
        rows={kind === "summary" ? 5 : 3}
        className="w-full resize-y rounded-lg border border-hairline bg-white px-3 py-3 text-sm leading-relaxed text-ink outline-none transition-colors focus:border-action-blue/40"
      />
      {commandOpen && (
        <div
          className="mt-2 rounded-lg border border-hairline bg-white p-2 shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="mb-2 flex flex-wrap gap-2">
            {(["bullet", "shorten", "expand", "quantify", "tone"] as BuilderCommand[]).map((command) => (
              <button
                key={command}
                type="button"
                disabled={isRunningCommand}
                onClick={() => applyCommand(command)}
                className="rounded-pill border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/60 hover:border-action-blue/30 hover:text-action-blue disabled:opacity-50"
              >
                /{command}
              </button>
            ))}
            <button
              type="button"
              disabled={isRunningCommand}
              onClick={() => setPendingKeyword(true)}
              className="rounded-pill border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/60 hover:border-action-blue/30 hover:text-action-blue disabled:opacity-50"
            >
              /keywords
            </button>
          </div>
          {pendingKeyword && (
            <div className="flex gap-2">
              <input
                value={keywordTarget}
                onChange={(event) => setKeywordTarget(event.target.value)}
                placeholder="Paste target role or JD..."
                className="h-9 flex-1 rounded-lg border border-hairline px-3 text-xs outline-none focus:border-action-blue/40"
              />
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-pill bg-action-blue text-white"
                disabled={!keywordTarget.trim() || isRunningCommand}
                onClick={() => applyCommand("keywords", keywordTarget)}
              >
                Apply
              </Button>
            </div>
          )}
          {isRunningCommand && (
            <p className="mt-2 flex items-center gap-2 text-xs text-ink/40">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running command...
            </p>
          )}
          {commandError && <p className="mt-2 text-xs font-medium text-red-600">{commandError}</p>}
        </div>
      )}
      {undoValue !== null && (
        <button
          type="button"
          onClick={() => {
            onChange(undoValue);
            setUndoValue(null);
          }}
          className="mt-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs font-semibold text-ink/50 hover:text-ink"
        >
          Undo command
        </button>
      )}
      {showGhost && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange(`${value}${suggestion.insert}`)}
          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-action-blue/15 bg-action-blue/5 px-3 py-2 text-xs font-semibold text-action-blue"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {suggestion.label}
        </button>
      )}
    </div>
  );
}

function StringListEditor({
  title,
  items,
  placeholder,
  multiline,
  wrapped,
  ghostKind,
  ghostPrefix,
  fieldPathPrefix,
  isRunningCommand,
  activeGhostField,
  onGhostFocus,
  onRunCommand,
  onChange,
}: {
  title: string;
  items: string[];
  placeholder: string;
  multiline?: boolean;
  wrapped?: boolean;
  ghostKind?: "summary" | "bullet" | "project";
  ghostPrefix?: string;
  fieldPathPrefix?: string;
  isRunningCommand?: boolean;
  activeGhostField?: string | null;
  onGhostFocus?: (field: string | null) => void;
  onRunCommand?: (payload: CommandPayload) => Promise<{ replacementText: string; explanation?: string }>;
  onChange: (items: string[]) => void;
}) {
  const update = (index: number, value: string) => onChange(items.map((item, i) => (i === index ? value : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className={cn("flex items-center gap-3", title ? "justify-between" : "justify-end")}>
        {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
        <Button type="button" size="sm" variant="outline" className="h-8 rounded-pill border-hairline" onClick={() => onChange([...items, ""])}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className={cn("space-y-2", wrapped && "grid grid-cols-1 gap-2 space-y-0 md:grid-cols-2")}>
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1">
              <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
              <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
            </div>
            <div className="flex-1">
              {multiline ? (
                <GhostTextarea
                  id={`${ghostPrefix}-${index}`}
                  kind={ghostKind || "bullet"}
                  value={item}
                  fieldPath={`${fieldPathPrefix}.${index}`}
                  activeGhostField={activeGhostField || null}
                  isRunningCommand={Boolean(isRunningCommand)}
                  onFocus={onGhostFocus || (() => {})}
                  onChange={(value) => update(index, value)}
                  onRunCommand={onRunCommand || (async () => ({ replacementText: item }))}
                />
              ) : (
                <input
                  value={item}
                  placeholder={placeholder}
                  onChange={(event) => update(index, event.target.value)}
                  className="h-11 w-full rounded-lg border border-hairline bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-action-blue/40"
                />
              )}
            </div>
            <IconButton label="Remove" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></IconButton>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-lg border border-dashed border-hairline px-4 py-3 text-sm text-ink/35">No items yet.</p>}
      </div>
    </div>
  );
}

function ArrayEditor<T>({
  title,
  items,
  emptyItem,
  onChange,
  renderItem,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  title: string;
  items: T[];
  emptyItem: () => T;
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (item: T) => void) => React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const update = (index: number, item: T) => onChange(items.map((entry, i) => (i === index ? item : entry)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <EditorSection
      title={title}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-hairline bg-white p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink/35">Item {index + 1}</span>
              <div className="flex items-center gap-1">
                <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
                <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === items.length - 1}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
                <IconButton label="Remove" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            </div>
            {renderItem(item, index, (next) => update(index, next))}
          </div>
        ))}
        {items.length === 0 && <p className="rounded-lg border border-dashed border-hairline px-4 py-6 text-sm text-ink/35">No {title.toLowerCase()} added yet.</p>}
        <Button type="button" variant="outline" className="h-10 rounded-pill border-hairline" onClick={() => onChange([...items, emptyItem()])}>
          <Plus className="mr-2 h-4 w-4" />
          Add {title}
        </Button>
      </div>
    </EditorSection>
  );
}

function IconButton({ label, children, disabled, onClick }: { label: string; children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-canvas text-ink/45 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function AtsPreview({ resume }: { resume: ResumeData }) {
  const contact = [
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.personalInfo.location,
    ...(resume.personalInfo.links || []),
  ].filter(Boolean);

  const order = resume.sectionOrder || ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "awards"];

  const sections: Record<string, React.ReactNode> = {
    summary: (
      <PreviewSection key="summary" title="Professional Summary" show={Boolean(resume.summary)}>
        <p className="text-sm leading-relaxed">{resume.summary}</p>
      </PreviewSection>
    ),
    experience: (
      <PreviewSection key="experience" title="Experience" show={resume.experience.length > 0}>
        {resume.experience.map((item, index) => (
          <PreviewEntry key={index} title={item.role} meta={[item.startDate, item.endDate || "Present"].filter(Boolean).join(" - ")} subtitle={item.company}>
            {item.bullets?.map((bullet, bulletIndex) => bullet && <li key={bulletIndex}>{bullet}</li>)}
          </PreviewEntry>
        ))}
      </PreviewSection>
    ),
    projects: (
      <PreviewSection key="projects" title="Projects" show={resume.projects.length > 0}>
        {resume.projects.map((item, index) => (
          <PreviewEntry key={index} title={item.name} subtitle={item.description}>
            {item.bullets?.map((bullet, bulletIndex) => bullet && <li key={bulletIndex}>{bullet}</li>)}
          </PreviewEntry>
        ))}
      </PreviewSection>
    ),
    education: (
      <PreviewSection key="education" title="Education" show={resume.education.length > 0}>
        {resume.education.map((item, index) => (
          <PreviewEntry key={index} title={item.degree} meta={item.gradDate} subtitle={[item.school, item.location].filter(Boolean).join(", ")} />
        ))}
      </PreviewSection>
    ),
    skills: (
      <PreviewSection key="skills" title="Skills" show={resume.skills.length > 0}>
        <p className="text-sm leading-relaxed">{resume.skills.filter(Boolean).join(", ")}</p>
      </PreviewSection>
    ),
    certifications: (
      <PreviewSection key="certifications" title="Certifications" show={resume.certifications.length > 0}>
        {resume.certifications.map((item, index) => (
          <p key={index} className="mb-1 text-sm">
            <strong>{item.name}</strong>{item.issuer ? ` - ${item.issuer}` : ""}{item.date ? ` (${item.date})` : ""}
          </p>
        ))}
      </PreviewSection>
    ),
    languages: (
      <PreviewSection key="languages" title="Languages" show={resume.languages.length > 0}>
        <p className="text-sm leading-relaxed">{resume.languages.filter(Boolean).join(", ")}</p>
      </PreviewSection>
    ),
    awards: (
      <PreviewSection key="awards" title="Awards" show={resume.awards.length > 0}>
        <ul className="list-disc space-y-1 pl-5 text-sm">{resume.awards.filter(Boolean).map((award, index) => <li key={index}>{award}</li>)}</ul>
      </PreviewSection>
    ),
  };

  return (
    <div className="mx-auto max-w-[820px] px-6 py-8">
      <div className="min-h-[1050px] bg-white px-12 py-12 text-[#111827] shadow-sm">
        <header className="border-b border-[#d1d5db] pb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{resume.personalInfo.name || "Your Name"}</h1>
          <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">{contact.join(" | ")}</p>
        </header>
        {order.map((sectionId) => sections[sectionId])}
      </div>
    </div>
  );
}

function PreviewSection({ title, show, children }: { title: string; show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-[#e5e7eb] pb-1 text-xs font-bold uppercase tracking-widest text-[#111827]">{title}</h2>
      {children}
    </section>
  );
}

function PreviewEntry({ title, meta, subtitle, children }: { title?: string; meta?: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-bold">{title}</h3>
        {meta && <span className="shrink-0 text-xs text-[#6b7280]">{meta}</span>}
      </div>
      {subtitle && <p className="mb-1 text-xs italic text-[#4b5563]">{subtitle}</p>}
      {children && <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">{children}</ul>}
    </div>
  );
}
