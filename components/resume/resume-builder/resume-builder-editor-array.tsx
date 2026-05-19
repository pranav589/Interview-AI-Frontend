import React, { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton, EditorSection } from "./resume-builder-editor-components";

function getItemLabel(title: string, item: any): string {
  if (title === "Experience") {
    const role = item?.role || "New Role";
    const company = item?.company;
    return company ? `${role} · ${company}` : role;
  }
  if (title === "Education") {
    const degree = item?.degree || "New Degree";
    const school = item?.school;
    return school ? `${degree} · ${school}` : degree;
  }
  if (title === "Projects") return item?.name || "New Project";
  if (title === "Certifications") return item?.name || "New Certification";
  return `Item 1`;
}

export function ArrayEditorItem<T>({
  title,
  item,
  index,
  total,
  renderItem,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  title: string;
  item: T;
  index: number;
  total: number;
  renderItem: (item: T, index: number, update: (item: T) => void) => React.ReactNode;
  onUpdate: (item: T) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = getItemLabel(title, item);

  return (
    <div className="rounded-lg border border-hairline bg-canvas">
      <div className="flex items-center justify-between gap-2 px-3 md:px-4 py-3 min-w-0">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-ink/30" />
          ) : (
            <ChevronUp className="h-4 w-4 shrink-0 text-ink/30" />
          )}
          <span className="truncate text-sm font-semibold text-ink">{label}</span>
        </button>
        <div className="flex flex-shrink-0 items-center gap-1">
          <IconButton label="Move up" onClick={onMoveUp} disabled={index === 0}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Move down" onClick={onMoveDown} disabled={index === total - 1}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton label="Remove" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
      {!collapsed && (
        <div className="border-t border-hairline px-3 md:px-4 pb-4 pt-4">
          {renderItem(item, index, onUpdate)}
        </div>
      )}
    </div>
  );
}

export function ArrayEditor<T>({
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
      <div className="space-y-3">
        {items.map((item, index) => (
          <ArrayEditorItem
            key={index}
            title={title}
            item={item}
            index={index}
            total={items.length}
            renderItem={renderItem}
            onUpdate={(next) => update(index, next)}
            onRemove={() => remove(index)}
            onMoveUp={() => move(index, -1)}
            onMoveDown={() => move(index, 1)}
          />
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-hairline px-4 py-8 text-center">
            <Plus className="h-5 w-5 text-ink/20" />
            <p className="text-sm text-ink/35">No {title.toLowerCase()} added yet.</p>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-pill border-hairline"
          onClick={() => onChange([...items, emptyItem()])}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {title}
        </Button>
      </div>
    </EditorSection>
  );
}
