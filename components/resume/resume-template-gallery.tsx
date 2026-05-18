"use client";

import React, { useState } from "react";
import { FileText, Download, Eye, CheckCircle2, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDownloadTemplate } from "@/hooks/use-resume";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
}

interface ResumeTemplateGalleryProps {
  sessionId: string;
  templates: Template[];
}

export function ResumeTemplateGallery({ sessionId, templates }: ResumeTemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const downloadMutation = useDownloadTemplate();

  const handleDownload = (templateId: string, format: "pdf" | "docx") => {
    downloadMutation.mutate({ sessionId, templateId, format });
  };

  const previewUrl = (templateId: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}resume/builder/${sessionId}/preview/${templateId}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Resume Ready
        </div>
        <h2 className="text-4xl font-bold text-black mb-4 tracking-tight">Choose Your Style</h2>
        <p className="text-lg text-black/50 max-w-2xl mx-auto">
          We&apos;ve generated three distinct, ATS-friendly layouts based on your profile. 
          Pick the one that best fits your target industry.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative bg-white border-black/5 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[3/4] relative bg-black/5 overflow-hidden">
                <iframe
                  src={previewUrl(template.id)}
                  className="w-full h-full border-none pointer-events-none scale-[0.35] origin-top transform-gpu translate-y-4"
                  title={template.name}
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Full Preview
                  </Button>
                </div>
              </div>

              <div className="p-6 border-t border-black/5">
                <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                <p className="text-sm text-black/60 mb-6 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-black text-white hover:bg-black/90"
                    disabled={downloadMutation.isPending}
                    onClick={() => handleDownload(template.id, "pdf")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-black/10 hover:bg-black/5"
                    disabled={downloadMutation.isPending}
                    onClick={() => handleDownload(template.id, "docx")}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    DOCX
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {templates.find(t => t.id === selectedTemplate)?.name} - Preview
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTemplate(null)}
                  className="text-black/40 hover:text-black"
                >
                  Close
                </Button>
              </div>
              <div className="flex-1 bg-zinc-100">
                <iframe
                  src={previewUrl(selectedTemplate)}
                  className="w-full h-full border-none"
                  title="Preview"
                />
              </div>
              <div className="p-6 border-t border-black/5 flex justify-end gap-3">
                 <Button
                    variant="outline"
                    onClick={() => handleDownload(selectedTemplate, "docx")}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Download DOCX
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleDownload(selectedTemplate, "pdf")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
