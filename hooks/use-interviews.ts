import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
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

export const useInterviewStats = () => {
  return useQuery({
    queryKey: ["interview-stats"],
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
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      // Use variables as they come from the frontend form, but they should now match backend expectations if possible
      // However, the caller might still be passing the old 'type', 'difficulty', etc.
      // I'll update the caller in follow-up steps, but for now I'll just pass 'data' directly.
      const response = await api.post<{
        message: string;
        interviewId: string;
        data: Interview;
      }>("interview", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};

export const useScoreHistory = () => {
  return useQuery({
    queryKey: ["score-history"],
    queryFn: async () => {
      const response = await api.get<{ data: Array<{ date: string; score: number; type: string }> }>("interview/score-history");
      return response.data;
    },
  });
};
