import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiResponse } from "@/lib/api";

export interface InterviewRecord {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  company: string;
  interviewType: string;
  difficultyLevel: string;
  duration: number;
  status: "not-started" | "in-progress" | "paused" | "completed";
  score?: number;
  createdAt: string;
}

export interface ScheduledInvite {
  _id: string;
  token: string;
  interviewId?: InterviewRecord | null;
  candidateName: string;
  candidateEmail: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: "pending" | "activated" | "completed" | "expired";
}

export interface RecruitmentJob {
  _id: string;
  title: string;
  company: string;
  description: string;
  interviewType: "technical" | "behavioral" | "mixed";
  difficultyLevel: "junior" | "intermediate" | "senior";
  duration: number;
  numberOfQuestions: number;
  customTopics: string;
  companyStyle: string;
  status: "active" | "archived";
  createdAt: string;
}

export const useRecruitmentJobs = () => {
  return useQuery({
    queryKey: ["recruitment-jobs"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<RecruitmentJob[]>>("jobs");
      return res.data || [];
    },
  });
};

export const useRecruitmentInvites = () => {
  return useQuery({
    queryKey: ["recruitment-invites"],
    queryFn: async () => {
      // In B2B mode, trigger the interview fetch to keep status in sync (same as fetchInvites)
      await api.get<ApiResponse<{ interviews: any[] }>>("interview", {
        params: { page: 1, limit: 100 },
      });
      const res = await api.get<ApiResponse<ScheduledInvite[]>>("invites/employer/list");
      return res.data || [];
    },
  });
};

export const useScheduleInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post<ApiResponse<any>>("invites/schedule", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-invites"] });
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post<ApiResponse<any>>("jobs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
    },
  });
};

export const useArchiveJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.patch<ApiResponse<any>>(`jobs/${jobId}`, { status: "archived" });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
    },
  });
};
