import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Interview, InterviewDetail, InterviewStats } from "@/lib/types";
export type { Interview, InterviewDetail, InterviewStats };

export const useInterviews = (params?: { page?: number; limit?: number; type?: string; difficulty?: string; status?: string }) => {
  return useQuery({
    queryKey: ["interviews", params],
    queryFn: async () => {
      const response = await api.get<{ data: Interview[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>("interview", { params });
      return response;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useSuspenseInterviews = (params?: { page?: number; limit?: number; type?: string; difficulty?: string; status?: string }) => {
  return useSuspenseQuery({
    queryKey: ["interviews", params],
    queryFn: async () => {
      const response = await api.get<{ data: Interview[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>("interview", { params });
      return response;
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
        message: string;
        interviewId: string;
        data: Interview;
      }>("interview", data);
      return response;
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
