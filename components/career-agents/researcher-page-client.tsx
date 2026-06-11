"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { TargetParametersForm } from "./target-parameters-form";
import { ActiveLoaderPanel } from "./active-loader-panel";
import { AwaitingDeployment } from "./awaiting-deployment";
import { StrategicDossierTabs, Dossier } from "./strategic-dossier-tabs";

export default function ResearcherPageClient() {
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [contactName, setContactName] = useState("");
  const [hookType, setHookType] = useState("Product Launch Hook");

  const [loaderPhase, setLoaderPhase] = useState(0);
  const [result, setResult] = useState<Dossier | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Manage active research phases visually for true high-fidelity loader
  const isPending = loaderPhase > 0 || result === null; 
  // Let's hook into React Query mutation status for pending operations
  const runResearcherMutation = useMutation({
    mutationFn: async (params: {
      companyName: string;
      targetRole: string;
      contactName: string;
      hookType: string;
    }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const cleanedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

      const response = await axios.post(
        `${cleanedBaseUrl}career-agents/researcher`,
        params,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.data);
        toast.success("Strategic Dossier compiled successfully!");
      } else {
        toast.error("Failed to compile dossier.");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to run agent. Please check your network or try again.");
    }
  });

  const isLoading = runResearcherMutation.isPending;

  useEffect(() => {
    if (!isLoading) {
      setLoaderPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setLoaderPhase((prev) => (prev < 3 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    if (!companyName || !targetRole) {
      toast.error("Please fill in both Company Name and Target Role.");
      return;
    }

    setResult(null);
    runResearcherMutation.mutate({
      companyName,
      targetRole,
      contactName,
      hookType
    });
  };

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-slide-up-fade">
      {/* Title Header */}
      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
          <Sparkles size={12} className="animate-pulse" />
          Autonomous AI Intelligence System
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight font-display bg-gradient-to-r from-ink to-ink-muted bg-clip-text text-transparent">
          Autonomous Company & Network Researcher
        </h1>
        <p className="text-ink-muted text-sm max-w-2xl leading-relaxed">
          Deploy deep-reasoning search loops to map live corporate intelligence, competitor positions, engineering infrastructure, and high-conversion outreach.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* INPUT PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <TargetParametersForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            contactName={contactName}
            setContactName={setContactName}
            hookType={hookType}
            setHookType={setHookType}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {/* OUTPUT OR LOADER PANEL */}
        <div className="lg:col-span-8">
          {isLoading && (
            <ActiveLoaderPanel companyName={companyName} loaderPhase={loaderPhase} />
          )}

          {!isLoading && !result && (
            <AwaitingDeployment />
          )}

          {!isLoading && result && (
            <StrategicDossierTabs
              result={result}
              copyText={copyText}
              copiedSection={copiedSection}
            />
          )}
        </div>
      </div>
    </div>
  );
}
