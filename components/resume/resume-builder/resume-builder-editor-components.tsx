import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GhostTextarea } from "./resume-builder-ghost-textarea";
import { CommandPayload } from "./resume-builder-types";

export function IconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
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

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink/40">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-action-blue/60 focus:ring-2 focus:ring-action-blue/20"
      />
    </label>
  );
}

export function EditorSection({
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

export function StringListEditor({
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
                  className="h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-action-blue/60 focus:ring-2 focus:ring-action-blue/20"
                />
              )}
            </div>
            <IconButton label="Remove" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></IconButton>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-hairline px-4 py-4 text-sm text-ink/35">
            <Plus className="h-4 w-4 text-ink/20" />
            No items yet — click Add to get started.
          </div>
        )}
      </div>
    </div>
  );
}
