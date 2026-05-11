import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/api"; 

export interface Resume {
  _id: string;
  name: string;
  resumeText: string;
  createdAt: string;
}

export interface ResumeJob {
  _id: string;
  jobType: "resume-analysis" | "jd-match" | "builder-export" | "jd-match-export";
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

export const useResumes = () => {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Resume[]>>("/resume");
      return response.data;
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
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<ApiResponse<Resume>>("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
};

export const useAnalyzeResume = () => {
  return useMutation({
    mutationFn: async (resumeId: string) => {
      return api.post<ApiResponse<ResumeJobKickoff>>("/resume/analyze", { resumeId });
    },
  });
};

export const useJdMatch = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post<ApiResponse<ResumeJobKickoff>>("/resume/jd-match", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });
};

export const useResumeJob = (jobId?: string) => {
  return useQuery({
    queryKey: ["resume-job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ResumeJob>>(`/resume/jobs/${jobId}`);
      return response.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "queued" || status === "processing") return 4000;
      return false;
    },
  });
};

export const useStartBuilder = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      return api.post<ApiResponse>("/resume/builder/start", { name });
    },
  });
};

export const useSendBuilderMessage = () => {
  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      return api.post<ApiResponse>("/resume/builder/message", { sessionId, message });
    },
  });
};

const triggerDownload = (blob: Blob, contentDisposition?: string, defaultFileName: string = "resume.pdf") => {
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
    mutationFn: async ({ resumeData, templateId, sessionId }: { resumeData?: any; templateId?: string; sessionId?: string }) => {
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
      triggerDownload(data.blob, data.contentDisposition || undefined, "resume.pdf");
    }
  });
};

export const useDownloadResumeJobArtifact = () => {
  return useMutation({
    mutationFn: async (jobId: string) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(`${normalizedBase}resume/jobs/${jobId}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download exported resume");
      }

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition") || undefined,
      };
    },
    onSuccess: (data) => {
      triggerDownload(data.blob, data.contentDisposition || undefined, "resume.pdf");
    }
  });
};

export const useExportJdMatch = () => {
  return useMutation({
    mutationFn: async ({ matchId, templateId }: { matchId: string; templateId?: string }) => {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      const response = await fetch(`${normalizedBase}resume/jd-match/${matchId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
      };
    },
    onSuccess: (data) => {
      triggerDownload(data.blob, data.contentDisposition || undefined, "matched-resume.pdf");
    }
  });
};

export const useJdMatchById = (id: string) => {
  return useQuery({
    queryKey: ["jd-match", id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>(`/resume/jd-match/${id}`);
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
      const response = await fetch(`${normalizedBase}resume/analyze/${id}/export`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to export analysis report");

      return {
        blob: await response.blob(),
        contentDisposition: response.headers.get("content-disposition"),
      };
    },
    onSuccess: (data, id) => {
      triggerDownload(data.blob, data.contentDisposition || undefined, `Analysis_Report_${id}.pdf`);
    }
  });
};
