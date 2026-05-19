"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeatureFlags } from "@/lib/feature-flags-context";
import {
  useCompleteBuilderSession,
  useDownloadTemplate,
  useResumes,
  useRunBuilderCommand,
  useSendBuilderMessage,
  useStartBuilder,
  useUpdateBuilderSession,
  useUploadResume,
} from "@/hooks/use-resume";

// Shared Types & Normalization Helpers
import {
  BuilderSession,
  CommandPayload,
  ResumeData,
  SaveStatus,
  emptyResumeData,
  normalizeDraft,
} from "./resume-builder-types";

// Child Components
import { IntakeMode } from "./resume-builder-chat";
import { EditorMode } from "./resume-builder-editor";

export function ResumeBuilderContent() {
  const router = useRouter();
  const { isFeatureEnabled, isLoading: isFlagsLoading } = useFeatureFlags();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [session, setSession] = useState<BuilderSession | null>(null);
  const [draft, setDraft] = useState<ResumeData>(emptyResumeData());
  const [mode, setMode] = useState<"intake" | "editor">("intake");
  const [inputText, setInputText] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [activeGhostField, setActiveGhostField] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSavedJsonRef = useRef("");
  const hasMountedEditorRef = useRef(false);

  const startMutation = useStartBuilder();
  const uploadMutation = useUploadResume();
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

  // Scroll to bottom on new messages
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length, sendMutation.isPending]);

  // Sync draft when entering editor
  useEffect(() => {
    if (!session || mode !== "editor") return;
    const nextDraft = normalizeDraft(session.resumeData);
    setDraft(nextDraft);
    lastSavedJsonRef.current = JSON.stringify(nextDraft);
    hasMountedEditorRef.current = false;
    setSaveStatus("saved");
  }, [mode, session?._id]);

  // Debounced auto-save
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

  // Upload a new file — stays on the same page, auto-selects the new resume card
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const doUpload = (forceReextract = false) => {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", file.name);
      if (forceReextract) formData.append("forceReextract", "true");

      uploadMutation.mutate(formData, {
        onSuccess: (res: any) => {
          const data = res?.data || {};
          const id = data.resumeId || data.resume?._id;
          const status = data.extractionStatus;

          if (data.isDuplicate && !data.startedExtraction && !forceReextract) {
            if (status === "pending" || status === "processing") {
              toast.info("Extraction is already running in the background. We'll notify you when it's ready.");
              if (id) setSelectedResumeId(id);
              return;
            }

            const shouldReextract = window.confirm(
              status === "failed"
                ? "The previous extraction for this resume failed. Do you want to retry?"
                : "This resume has already been extracted. Do you want to extract it again?",
            );

            if (shouldReextract) {
              doUpload(true);
              return;
            }

            toast.success("Using the existing extracted resume.");
            if (id) setSelectedResumeId(id);
            return;
          }

          toast.success(
            data.startedExtraction
              ? "Resume uploaded. Details are being extracted in the background; we'll notify you when it's ready."
              : "Resume uploaded!",
          );
          if (id) setSelectedResumeId(id);
        },
        onError: (error: any) => toast.error(error?.message || "Upload failed"),
      });
    };

    doUpload(false);
  };

  // Continue — start a builder session from the selected (already-extracted) resume
  const handleStart = () => {
    if (!selectedResumeId) {
      toast.error("Choose a saved resume or upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resumeId", selectedResumeId);

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
        selectedResumeId={selectedResumeId}
        resumes={resumesQuery.data || []}
        isLoadingResumes={resumesQuery.isLoading}
        isUploading={uploadMutation.isPending}
        isStarting={startMutation.isPending}
        onFileUpload={handleFileUpload}
        onPickResume={setSelectedResumeId}
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
  selectedResumeId,
  resumes,
  isLoadingResumes,
  isUploading,
  isStarting,
  onFileUpload,
  onPickResume,
  onStart,
}: {
  selectedResumeId: string | null;
  resumes: Array<{ _id: string; name: string; createdAt?: string; extractionStatus?: string }>;
  isLoadingResumes: boolean;
  isUploading: boolean;
  isStarting: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickResume: (resumeId: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="w-full bg-canvas">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden bg-canvas">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 py-12 md:py-20">
          <div className="flex flex-col justify-center space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-action-blue" />
                <span className="text-action-blue font-semibold tracking-wider text-xs uppercase">Creation Engine</span>
              </div>

              <h1 className="text-[56px] md:text-[72px] font-semibold leading-[1.05] tracking-[-0.03em] mb-8 text-ink">
                Build your story. <br />
                <span className="text-ink/40">From scratch to offer.</span>
              </h1>

              <p className="text-xl md:text-2xl text-ink/50 leading-relaxed max-w-[540px] font-medium mb-6 md:mb-12">
                Start with a saved resume or upload a new PDF. The AI will extract the structure, spot gaps, and ask the next best question.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="rounded-pill w-full md:w-auto px-10 h-14 text-white text-lg font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 group shadow-xl shadow-action-blue/20"
                  onClick={() => document.getElementById("builder-selection")?.scrollIntoView({ behavior: "smooth" })}
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
                Choose a version from your vault or upload a new PDF to begin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Card */}
            <label className="group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-hairline border-dashed bg-white/50 hover:bg-white hover:border-action-blue/50 cursor-pointer transition-all duration-300 min-h-[160px]">
              <Input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={onFileUpload}
                disabled={isUploading}
              />
              <div className="w-10 h-10 rounded-full bg-action-blue/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-action-blue" />
                ) : (
                  <Upload className="w-5 h-5 text-action-blue" />
                )}
              </div>
              <p className="text-sm font-semibold text-ink">Upload PDF</p>
            </label>

            {/* Resume Cards */}
            {resumes.map((resume, index) => (
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
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                        selectedResumeId === resume._id ? "bg-action-blue text-white" : "bg-action-blue/5 text-action-blue"
                      }`}
                    >
                      {resume.extractionStatus === "processing" || resume.extractionStatus === "pending" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    {selectedResumeId === resume._id && <CheckCircle2 className="w-4 h-4 text-action-blue" />}
                  </div>
                  <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-tight mb-1">{resume.name}</h3>
                  <p className="text-[10px] text-ink/30 font-medium">
                    {resume.extractionStatus === "processing" || resume.extractionStatus === "pending"
                      ? "Extracting…"
                      : resume.createdAt
                      ? new Date(resume.createdAt).toLocaleDateString()
                      : "Saved resume"}
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
              disabled={!selectedResumeId || isStarting}
              onClick={onStart}
              className="rounded-pill px-12 py-8 text-white text-xl font-semibold bg-action-blue hover:bg-action-blue-hover transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-action-blue/20"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-6 h-6 ml-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

