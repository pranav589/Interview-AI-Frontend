import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Interview, InterviewDetail, InterviewStats, InterviewJob, InterviewJobKickoff } from "@/lib/types";
export type { Interview, InterviewDetail, InterviewStats, InterviewJob, InterviewJobKickoff };

export const useInterviews = (params?: { page?: number; limit?: number; type?: string; difficulty?: string; status?: string }) => {
  return useQuery({
    queryKey: ["interviews", params],
    queryFn: async () => {
      const response = await api.get<{ data: { interviews: Interview[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>("interview", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useSuspenseInterviews = (params?: { page?: number; limit?: number; type?: string; difficulty?: string; status?: string }) => {
  return useSuspenseQuery({
    queryKey: ["interviews", params],
    queryFn: async () => {
      const response = await api.get<{ data: { interviews: Interview[]; pagination: { total: number; page: number; limit: number; totalPages: number } } }>("interview", { params });
      return response.data;
    },
  });
};

export const useInterviewDetails = (id: string) => {
  return useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>(`interview/${id}`);
      return response.data as InterviewDetail;
    },
    enabled: !!id,
  });
};

export const useSuspenseInterviewDetails = (id: string) => {
  return useSuspenseQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>(`interview/${id}`);
      return response.data as InterviewDetail;
    },
  });
};

export const useInterviewStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["interview-stats", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: InterviewStats }>(
        "interview/stats",
      );
      return response.data;
    },
    enabled: !!user,
  });
};

export const useSuspenseInterviewStats = () => {
  const { user } = useAuth();
  return useSuspenseQuery({
    queryKey: ["interview-stats", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: InterviewStats }>(
        "interview/stats",
      );
      return response.data;
    },
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<{
        data: {
          interviewId: string;
          interview: Interview;
          updatedCredits: number;
        };
      }>("interview", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["interview-stats", user?.id] });
    },
  });
};

export const useScoreHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["score-history", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: Array<{ date: string; score: number; type: string }> }>("interview/score-history");
      return response.data;
    },
    enabled: !!user,
  });
};

export const useSuspenseScoreHistory = () => {
  const { user } = useAuth();
  return useSuspenseQuery({
    queryKey: ["score-history", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: Array<{ date: string; score: number; type: string }> }>("interview/score-history");
      return response.data;
    },
  });
};

export const useGenerateFeedback = () => {
  return useMutation({
    mutationFn: async ({ threadId, actualDuration }: { threadId: string; actualDuration: number }) => {
      const response = await api.post<{ data: InterviewJobKickoff }>(`interview/feedback`, { threadId, actualDuration });
      return response.data;
    },
  });
};

export const useInterviewJob = (jobId?: string) => {
  return useQuery({
    queryKey: ["interview-job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await api.get<{ data: InterviewJob }>(`interview/jobs/${jobId}`);
      return response.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "queued" || status === "processing") return 3000;
      return false;
    },
  });
};
