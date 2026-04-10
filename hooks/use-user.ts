import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { MESSAGES } from "@/lib/constants";

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
      const response = await api.post("user/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success(MESSAGES.RESUME.UPLOAD_SUCCESS);
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
