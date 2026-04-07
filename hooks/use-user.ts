import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update settings");
      console.error(error);
    },
  });
};
