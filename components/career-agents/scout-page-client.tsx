"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

import { ScoutParametersForm } from "./scout-parameters-form";
import { ScoutActiveLoader } from "./scout-active-loader";
import { AwaitingDeployment } from "./awaiting-deployment";
import { ScoutDossierTabs, ScoutDossier } from "./scout-dossier-tabs";

export default function ScoutPageClient() {
  const [companyName, setCompanyName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");

  const [loaderPhase, setLoaderPhase] = useState(0);
  const [result, setResult] = useState<ScoutDossier | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const runScoutMutation = useMutation({
    mutationFn: async (params: {
      companyName: string;
      targetRole: string;
      divisionFilter?: string;
    }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const cleanedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

      const response = await axios.post(
        `${cleanedBaseUrl}career-agents/scout`,
        params,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.data);
        toast.success("Strategic Network Map compiled successfully!");
      } else {
        toast.error("Failed to compile network map.");
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to deploy Scout agent. Please try again.");
    }
  });

  const isLoading = runScoutMutation.isPending;

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
    runScoutMutation.mutate({
      companyName,
      targetRole,
      divisionFilter: divisionFilter || undefined
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
          Autonomous Network Mapping System
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight font-display bg-gradient-to-r from-ink to-ink-muted bg-clip-text text-transparent">
          Network Scout & Decision-Maker Matcher
        </h1>
        <p className="text-ink-muted text-sm max-w-2xl leading-relaxed">
          Deploy deep-reasoning network scout loops to map target engineering divisions, active hiring locations, key decision-makers, and talent acquisition teams.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* INPUT PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <ScoutParametersForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            divisionFilter={divisionFilter}
            setDivisionFilter={setDivisionFilter}
            onSubmit={handleGenerate}
            isLoading={isLoading}
          />
        </div>

        {/* OUTPUT OR LOADER PANEL */}
        <div className="lg:col-span-8">
          {isLoading && (
            <ScoutActiveLoader companyName={companyName} loaderPhase={loaderPhase} />
          )}

          {!isLoading && !result && (
            <AwaitingDeployment />
          )}

          {!isLoading && result && (
            <ScoutDossierTabs
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
