import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/api";

export interface Resume {
  _id: string;
  name: string;
  resumeText: string;
  isDefault?: boolean;
  extractionStatus?: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt?: string;
}

export interface ResumeJob {
  _id: string;
  jobType:
    | "resume-extraction"
    | "resume-analysis"
    | "jd-match"
    | "builder-export"
    | "jd-match-export";
  status: "queued" | "processing" | "completed" | "failed";
  error?: string;
  resultRef?: {
    analysisId?: string;
    jdMatchId?: string;
    generatedResumeId?: string;
  };
}

export interface ResumeJobKickoff {
  jobId: string;
  status: "queued" | "processing";
}

export interface ResumeUploadResult {
  resume?: Resume;
  resumeId: string;
  jobId?: string;
  extractionStatus?: Resume["extractionStatus"];
  isDuplicate: boolean;
  startedExtraction: boolean;
  requiresConfirmation?: boolean;
}

export const useResumes = () => {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Resume[]>>("/resume");
      return response.data;
    },
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        (r) =>
          r.extractionStatus === "pending" ||
          r.extractionStatus === "processing",
      );
      return hasPending ? 4000 : false;
    },
  });
};

export const useSuspenseResumes = () => {
  return useSuspenseQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Resume[]>>("/resume");
      return response.data;
    },
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        (r) =>
          r.extractionStatus === "pending" ||
          r.extractionStatus === "processing",
      );
      return hasPending ? 4000 : false;
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<ApiResponse<ResumeUploadResult>>(
        "/resume/upload",
        formData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
};

export const useSetDefaultResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resumeId: string) => {
      return api.patch<ApiResponse<Resume>>(`/resume/${resumeId}/default`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
};

export const useAnalyzeResume = () => {
  return useMutation({
    mutationFn: async (resumeId: string) => {
      return api.post<ApiResponse<ResumeJobKickoff>>("/resume/analyze", {
        resumeId,
      });
    },
  });
};

export const useJdMatch = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<ApiResponse<ResumeJobKickoff>>(
        "/resume/jd-match",
        formData,
      );
    },
  });
};

export const useResumeJob = (jobId?: string) => {
  return useQuery({
    queryKey: ["resume-job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResumeJob>>(
        `/resume/jobs/${jobId}`,
      );
      return response.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "queued" || status === "processing")
        return 4000;
      return false;
    },
  });
};

export const useStartBuilder = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<
        ApiResponse<{
          session: any;
          sessionId: string;
          jobId: string;
          extractionStatus: string;
        }>
      >("/resume/builder/start", formData);
    },
  });
};

export const useBuilderJob = (jobId?: string) => {
  return useQuery({
    queryKey: ["builder-job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResumeJob>>(
        `/resume/jobs/${jobId}`,
      );
      return response.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "queued" || status === "processing")
        return 5000;
      return false;
    },
  });
};

export const useSendBuilderMessage = () => {
  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
    }: {
      sessionId: string;
      message: string;
    }) => {
      return api.post<ApiResponse>("/resume/builder/message", {
        sessionId,
        message,
      });
    },
  });
};

export const useBuilderSession = (sessionId?: string) => {
  return useQuery({
    queryKey: ["builder-session", sessionId],
    enabled: Boolean(sessionId),
    queryFn: async () => {
      const response = await api.get<ApiResponse>(
        `/resume/builder/${sessionId}`,
      );
      return response.data;
    },
  });
};

export const useUpdateBuilderSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      resumeData,
      templateId,
      currentStep,
    }: {
      sessionId: string;
      resumeData?: any;
      templateId?: string;
      currentStep?: string;
    }) => {
      return api.patch<ApiResponse>(`/resume/builder/${sessionId}`, {
        resumeData,
        templateId,
        currentStep,
      });
    },
    onSuccess: (response: any, variables) => {
      queryClient.setQueryData(
        ["builder-session", variables.sessionId],
        response.data,
      );
    },
  });
};

export const useCompleteBuilderSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      return api.post<ApiResponse>(`/resume/builder/${sessionId}/complete`);
    },
    onSuccess: (response: any, sessionId) => {
      queryClient.setQueryData(["builder-session", sessionId], response.data);
    },
  });
};

export const useRunBuilderCommand = () => {
  return useMutation({
    mutationFn: async ({
      sessionId,
      command,
      fieldPath,
      selectedText,
      fieldText,
      resumeData,
      targetContext,
    }: {
      sessionId: string;
      command:
        | "bullet"
        | "shorten"
        | "expand"
        | "quantify"
        | "tone"
        | "keywords";
      fieldPath: string;
      selectedText?: string;
      fieldText: string;
      resumeData: any;
      targetContext?: string;
    }) => {
      return api.post<
        ApiResponse<{ replacementText: string; explanation?: string }>
      >(`/resume/builder/${sessionId}/command`, {
        command,
        fieldPath,
        selectedText,
        fieldText,
        resumeData,
        targetContext,
      });
    },
  });
};

const triggerDownload = (
  blob: Blob,
  contentDisposition?: string,
  defaultFileName: string = "resume.pdf",
) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  let fileName = defaultFileName;
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (fileNameMatch) fileName = fileNameMatch[1];
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const useExportResume = () => {
  return useMutation({
    mutationFn: async ({
      resumeData,
      templateId,
      sessionId,
    }: {
      resumeData?: any;
      templateId?: string;
      sessionId?: string;
    }) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(`${normalizedBase}resume/builder/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, templateId, sessionId }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
      };
    },
    onSuccess: (data) => {
      triggerDownload(
        data.blob,
        data.contentDisposition || undefined,
        "resume.pdf",
      );
    },
  });
};

export const useDownloadResumeJobArtifact = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(
        `${normalizedBase}resume/jobs/${jobId}/download`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download exported resume");
      }

      return {
        blob: await response.blob(),
        contentDisposition:
          response.headers.get("content-disposition") || undefined,
      };
    },
    onSuccess: (data) => {
      triggerDownload(
        data.blob,
        data.contentDisposition || undefined,
        "resume.pdf",
      );
    },
  });
};

export const useExportJdMatch = () => {
  return useMutation({
    mutationFn: async ({
      matchId,
      templateId,
    }: {
      matchId: string;
      templateId?: string;
    }) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(
        `${normalizedBase}resume/jd-match/${matchId}/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to generate PDF");

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
      };
    },
    onSuccess: (data) => {
      triggerDownload(
        data.blob,
        data.contentDisposition || undefined,
        "matched-resume.pdf",
      );
    },
  });
};

export const useJdMatchById = (id: string) => {
  return useQuery({
    queryKey: ["jd-match", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(
        `/resume/jd-match/${id}`,
      );
      return response.data;
    },
    enabled: Boolean(id),
  });
};

export const useAnalysisById = (id: string) => {
  return useQuery({
    queryKey: ["resume-analysis", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/resume/analyze/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
};

export const useAnalyses = () => {
  return useQuery({
    queryKey: ["resume-analyses"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any[]>>("/resume/analyze");
      return response.data || [];
    },
  });
};

export const useJdMatches = () => {
  return useQuery({
    queryKey: ["jd-matches"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any[]>>("/resume/jd-match");
      return response.data || [];
    },
  });
};

export const useSuspenseJdMatches = () => {
  return useSuspenseQuery({
    queryKey: ["jd-matches"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any[]>>("/resume/jd-match");
      return response.data || [];
    },
  });
};

export const useExportAnalysis = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(
        `${normalizedBase}resume/analyze/${id}/export`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to export analysis report");

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
      };
    },
    onSuccess: (data, id) => {
      triggerDownload(
        data.blob,
        data.contentDisposition || undefined,
        `Analysis_Report_${id}.pdf`,
      );
    },
  });
};

export const useGenerateTemplates = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post<ApiResponse<{ templates: any[] }>>(
        "/resume/builder/generate",
        { sessionId },
      );
      return response;
    },
  });
};

export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: async ({
      sessionId,
      templateId,
      format,
    }: {
      sessionId: string;
      templateId: string;
      format: "pdf" | "docx";
    }) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(
        `${normalizedBase}resume/builder/${sessionId}/download/${templateId}?format=${format}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok)
        throw new Error(`Failed to download ${format.toUpperCase()}`);

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
        format,
        templateId,
      };
    },
    onSuccess: (data) => {
      const extension = data.format === "pdf" ? "pdf" : "docx";
      triggerDownload(
        data.blob,
        data.contentDisposition || undefined,
        `Resume_${data.templateId}.${extension}`,
      );
    },
  });
};
