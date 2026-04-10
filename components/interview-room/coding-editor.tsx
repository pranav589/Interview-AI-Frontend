"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import {
  Play,
  Send,
  Terminal,
  Code2,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useCodeRunner } from "@/hooks/use-code-runner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", comingSoon: false },
  { label: "Python", value: "python", comingSoon: false },
  { label: "Java", value: "java", comingSoon: true },
  { label: "C++", value: "cpp", comingSoon: true },
  { label: "TypeScript", value: "typescript", comingSoon: false },
];

interface CodingEditorProps {
  initialLanguage?: string;
  onSubmit: (code: string, language: string) => void;
}

export default function CodingEditor({
  initialLanguage = "javascript",
  onSubmit,
}: CodingEditorProps) {
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { execute, isRunning, isPyodideLoading } = useCodeRunner();

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(code, language);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setOutput("");
    setError("");

    try {
      const result = await execute(code, language);
      if (result.stdout) setOutput(result.stdout);
      if (result.stderr) setError(result.stderr);

      if (!result.stdout && !result.stderr) {
        setOutput("[Execution finished with no output]");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during execution.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col h-full w-full gap-4 overflow-hidden"
    >
      <Card className="flex flex-col h-full overflow-hidden border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Coding Challenge</h3>
              <p className="text-xs text-muted-foreground">
                Implement the solution below
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] bg-background/50 border-primary/20">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div
                      className={`flex items-center justify-between gap-4 w-full min-w-[120px] ${lang.comingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span>{lang.label}</span>
                      {lang.comingSoon && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1 bg-primary/5 text-muted-foreground border-primary/10"
                        >
                          Soon
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCode("")}
              title="Reset Code"
              className="border-primary/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-[#1e1e1e] min-h-[200px]">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              fontFamily: "var(--font-mono)",
              cursorBlinking: "smooth",
              lineNumbers: "on",
              renderLineHighlight: "all",
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
              },
            }}
          />
        </div>

        {/* Console / Footer */}
        <div className="border-t border-primary/10 flex flex-col">
          {/* Console Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-primary/5">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              Console Output
            </div>
            {output || error ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                  setOutput("");
                  setError("");
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>

          {/* Output Content */}
          <div className="h-40 bg-[#1e1e1e] p-4 overflow-y-auto font-mono text-sm border-b border-primary/10 relative">
            {isRunning ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-primary animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs uppercase tracking-widest font-semibold">
                  {isPyodideLoading
                    ? "Initializing Python Engine..."
                    : "Executing locally..."}
                </span>
              </div>
            ) : output || error ? (
              <div className="space-y-2">
                {output && (
                  <pre className="text-emerald-400 whitespace-pre-wrap selection:bg-emerald-500/20">
                    {output}
                  </pre>
                )}
                {error && (
                  <pre className="text-rose-400 whitespace-pre-wrap bg-rose-500/5 p-2 rounded border border-rose-500/10 selection:bg-rose-500/20">
                    {error}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 italic gap-2">
                <Sparkles className="w-8 h-8 opacity-20" />
                <span>No output to display. Run your code to see results.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-muted/40 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={runCode}
              disabled={isRunning || isSubmitting}
              className="gap-2 border-primary/20 hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Play className="w-4 h-4 text-emerald-500" />
              )}
              {isRunning ? "Running..." : "Run Code"}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 transition-all active:scale-95 px-6"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Solution
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
