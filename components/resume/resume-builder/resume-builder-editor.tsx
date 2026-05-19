import React from "react";
import {
  RotateCcw,
  Loader2,
  CheckCircle2,
  Download,
  FileDown,
  Save,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AtsPreview } from "./resume-builder-preview";
import { ResumeForm } from "./resume-builder-editor-form";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerHeader,
} from "@/components/ui/drawer";
import {
  BuilderSession,
  CommandPayload,
  ResumeData,
  SaveStatus,
} from "./resume-builder-types";

export function EditorMode({
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
  onRunCommand: (
    payload: CommandPayload,
  ) => Promise<{ replacementText: string; explanation?: string }>;
}) {
  return (
    <div className="flex min-h-[calc(100vh-52px)] flex-col bg-canvas">
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline bg-canvas/95 px-4 md:px-6 py-3 md:py-4 backdrop-blur">
        {/* Left Section: Back button and Truncated Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            className="rounded-pill border-hairline h-9 px-3"
            onClick={onBack}
          >
            <RotateCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-action-blue leading-none">
              Phase 2 Editor
            </p>
            <h1 className="text-sm md:text-base font-semibold leading-tight text-ink truncate max-w-[180px] sm:max-w-[240px] md:max-w-[320px] lg:max-w-none">
              {session.name}
            </h1>
          </div>
        </div>

        {/* Right Section: Compact actions and indicators grouped on a single row */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <SaveState status={saveStatus} />
          <div className="flex items-center gap-2">
            <Button
              className="rounded-pill bg-action-blue text-white hover:bg-action-blue-hover h-9 text-xs md:text-sm px-4"
              onClick={onFinish}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Finish
            </Button>

            {/* Export split button */}
            <div className="relative">
              <div className="flex items-stretch overflow-hidden rounded-pill border border-hairline h-9">
                <button
                  title={
                    canDownload
                      ? "Download PDF"
                      : "Finish the resume first to unlock exports"
                  }
                  disabled={!canDownload || isDownloading}
                  onClick={() => onDownload("pdf")}
                  className="flex items-center gap-1.5 border-r border-hairline px-3 py-2 text-xs font-semibold text-ink/60 transition-colors hover:bg-canvas-parchment hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  PDF
                </button>
                <button
                  title={
                    canDownload
                      ? "Download DOCX"
                      : "Finish the resume first to unlock exports"
                  }
                  disabled={!canDownload || isDownloading}
                  onClick={() => onDownload("docx")}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink/60 transition-colors hover:bg-canvas-parchment hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  DOCX
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid container with Tailwind responsive view toggles */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(420px,0.9fr)_minmax(420px,0.75fr)]">
        {/* Editor Form: Full width on mobile, split pane on desktop */}
        <ScrollArea className="h-[calc(100vh-133px)] border-r-0 lg:border-r border-hairline bg-canvas w-full block">
          <ResumeForm
            draft={draft}
            activeGhostField={activeGhostField}
            isRunningCommand={isRunningCommand}
            onDraftChange={onDraftChange}
            onGhostFocus={onGhostFocus}
            onRunCommand={onRunCommand}
          />
        </ScrollArea>

        {/* Desktop Preview Pane: Hidden on mobile, shown on desktop viewports */}
        <ScrollArea className="hidden lg:block h-[calc(100vh-133px)] bg-canvas-parchment">
          <AtsPreview resume={draft} />
        </ScrollArea>
      </div>

      {/* Mobile/Tablet Preview Panel: Bottom sheet drawer floating trigger */}
      <div className="lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-pill bg-action-blue text-white px-5 py-3 text-sm font-semibold shadow-xl shadow-action-blue/20 transition-all hover:bg-action-blue-hover active:scale-95 border border-white/10"
            >
              <Eye className="h-4 w-4" />
              Preview Resume
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh] bg-background rounded-t-[20px] overflow-hidden">
            <DrawerHeader className="border-b border-hairline flex items-center justify-between px-6 py-4 bg-canvas">
              <div>
                <DrawerTitle className="text-base font-semibold text-ink">
                  Resume Preview
                </DrawerTitle>
                <p className="text-xs text-ink/40">
                  Real-time ATS preview of your document
                </p>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-ink/30 hover:bg-background hover:text-ink transition-colors"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </DrawerHeader>

            {/* Scrollable preview container within the bottom drawer */}
            <ScrollArea className="h-[calc(85vh-75px)] w-full bg-canvas-parchment">
              <div className="p-4 pb-16">
                <div className="rounded-xl border border-hairline bg-canvas p-1 shadow-sm">
                  <AtsPreview resume={draft} />
                </div>
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export function SaveState({ status }: { status: SaveStatus }) {
  const labels = {
    saved: "Saved",
    unsaved: "Unsaved changes",
    saving: "Saving...",
    error: "Save failed",
  };
  const colorClass = {
    saved:
      "border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400",
    unsaved:
      "border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400",
    saving: "border-hairline text-ink/45",
    error: "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400",
  }[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-pill border px-3 py-2 text-xs font-semibold",
        colorClass,
      )}
    >
      {status === "saving" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Save className="h-3.5 w-3.5" />
      )}
      {labels[status]}
    </div>
  );
}
