import React, { useEffect, useRef, useState } from "react";
import {
  Wand2,
  Minimize2,
  Maximize2,
  Hash,
  Volume2,
  Tag,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BuilderCommand,
  CommandPayload,
  ghostSuggestion,
} from "./resume-builder-types";

export const COMMAND_ICONS: Record<BuilderCommand, React.ReactNode> = {
  bullet: <Wand2 className="h-3.5 w-3.5" />,
  shorten: <Minimize2 className="h-3.5 w-3.5" />,
  expand: <Maximize2 className="h-3.5 w-3.5" />,
  quantify: <Hash className="h-3.5 w-3.5" />,
  tone: <Volume2 className="h-3.5 w-3.5" />,
  keywords: <Tag className="h-3.5 w-3.5" />,
};

export function GhostTextarea({
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
        className="w-full resize-y rounded-lg border border-hairline bg-canvas px-3 py-3 text-sm leading-relaxed text-ink outline-none transition-colors focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue/60"
      />
      {commandOpen && (
        <div
          className="mt-2 rounded-xl border border-hairline bg-canvas shadow-lg dark:shadow-black/40"
          onMouseDown={(event) => event.preventDefault()}
        >
          {/* Palette header */}
          <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/40">AI Commands</span>
            <button
              type="button"
              onClick={() => { setCommandOpen(false); setPendingKeyword(false); }}
              className="rounded-lg p-1 text-ink/30 hover:bg-canvas-parchment hover:text-ink"
              aria-label="Close command palette"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {(["bullet", "shorten", "expand", "quantify", "tone"] as BuilderCommand[]).map((command) => (
                <button
                  key={command}
                  type="button"
                  disabled={isRunningCommand}
                  onClick={() => applyCommand(command)}
                  className="flex items-center gap-1.5 rounded-pill border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/60 hover:border-action-blue/30 hover:text-action-blue disabled:opacity-50"
                >
                  {COMMAND_ICONS[command]}
                  /{command}
                </button>
              ))}
              <button
                type="button"
                disabled={isRunningCommand}
                onClick={() => setPendingKeyword(true)}
                className="flex items-center gap-1.5 rounded-pill border border-hairline px-3 py-1.5 text-xs font-semibold text-ink/60 hover:border-action-blue/30 hover:text-action-blue disabled:opacity-50"
              >
                {COMMAND_ICONS["keywords"]}
                /keywords
              </button>
            </div>
            {pendingKeyword && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-ink/50">Paste job description or target role</label>
                <div className="flex gap-2">
                  <input
                    value={keywordTarget}
                    onChange={(event) => setKeywordTarget(event.target.value)}
                    placeholder="e.g. Senior Frontend Engineer at Stripe..."
                    className="h-9 flex-1 rounded-lg border border-hairline px-3 text-xs outline-none focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue/60"
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
              </div>
            )}
            {isRunningCommand && (
              <p className="mt-2 flex items-center gap-2 text-xs text-ink/40">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running command...
              </p>
            )}
            {commandError && <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{commandError}</p>}
          </div>
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
