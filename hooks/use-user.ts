import { useMutation, useQueryClient, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { MESSAGES } from "@/lib/constants";

export interface UserResumeUploadResult {
  resumeText: string;
  user: any;
  resumeId?: string;
  jobId?: string;
  extractionStatus?: "pending" | "processing" | "completed" | "failed";
  isDuplicate: boolean;
  startedExtraction: boolean;
  requiresConfirmation?: boolean;
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { weeklyEmailDigest?: boolean }) => {
      const response = await api.patch<{ message: string; user: any }>("user/settings", data);
      return response;
    },
    onSuccess: () => {
      // Invalidate user profile if needed, or update local cache
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success(MESSAGES.SETTINGS.UPDATE_SUCCESS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.response?.data?.error?.message || MESSAGES.SETTINGS.UPDATE_FAILED);
      console.error(error);
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<{ success: boolean; message?: string; data: UserResumeUploadResult }>("user/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    },
    onSuccess: async (response) => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      const data = response?.data;
      if (data?.isDuplicate && !data.startedExtraction) {
        if (data.extractionStatus === "pending" || data.extractionStatus === "processing") {
          toast.info("Extraction is already running in the background. We'll notify you when it's ready.");
        } else if (data.extractionStatus === "completed") {
          toast.success("Using the existing extracted resume.");
        } else {
          toast.warning("This resume was uploaded, but the previous extraction failed. You can retry extraction later.");
        }
        return;
      }

      toast.success(
        response?.message ||
          "Resume uploaded. Details are being extracted in the background; we'll notify you when it's ready.",
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || MESSAGES.RESUME.UPLOAD_FAILED);
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async () => {
      return await api.post("user/complete-onboarding");
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(MESSAGES.ONBOARDING.COMPLETE_FAILED, error);
    },
  });
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>("user/dashboard-stats");
      return response.data;
    },
    enabled: !!user,
  });
};

export const useSuspenseDashboardStats = () => {
  const { user } = useAuth();
  return useSuspenseQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const response = await api.get<{ data: any }>("user/dashboard-stats");
      return response.data;
    },
  });
};
