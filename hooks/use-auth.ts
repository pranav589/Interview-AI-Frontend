import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { MESSAGES } from "@/lib/constants";
import { User } from "@/lib/types";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; password: string; twoFactorCode?: string }) => {
      const response = await api.post<any>("auth/login", data);
      return response;
    },
    onSuccess: (response) => {
      const data = response?.data;
      if (data && !data.twoFactorRequired) {
        localStorage.setItem('is-logged-in', 'true');
        queryClient.invalidateQueries({ queryKey: ["auth-user"] });
        toast.success(MESSAGES.AUTH.SIGNIN_SUCCESS);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || MESSAGES.AUTH.SIGNIN_FAILED);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      return await api.post("auth/register", data);
    },
    onSuccess: () => {
      localStorage.setItem('is-logged-in', 'true');
      toast.success(MESSAGES.AUTH.SIGNUP_SUCCESS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || MESSAGES.AUTH.SIGNUP_FAILED);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await api.post("auth/logout");
    },
    onSuccess: () => {
      // Clear all auth-related cache and hint
      localStorage.removeItem('is-logged-in');
      queryClient.setQueryData(["auth-user"], null);
      queryClient.removeQueries({ queryKey: ["auth-user"] });
      toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still clear local state on error
      queryClient.setQueryData(["auth-user"], null);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      return await api.get(`auth/verify-email?token=${token}`);
    },
    onSuccess: () => {
      toast.success("Email verified successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Email verification failed");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await api.post("auth/forgot-password", { email });
    },
    onSuccess: () => {
      toast.success(MESSAGES.AUTH.VERIFICATION_SENT);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || MESSAGES.AUTH.ERROR_OCCURRED);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      return await api.post("auth/reset-password", data);
    },
    onSuccess: () => {
      toast.success(MESSAGES.AUTH.RESET_PASSWORD_SUCCESS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || MESSAGES.AUTH.RESET_PASSWORD_FAILED);
    },
  });
};

export const useSetup2FA = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<{ data: { otpAuthUrl: string } }>("auth/2fa/setup");
      return response.data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "2FA setup failed");
    },
  });
};

export const useVerify2FA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      return await api.post("auth/2fa/verify", { code });
    },
    onSuccess: () => {
      // Update local cache to reflect 2FA is enabled
      queryClient.setQueryData(["auth-user"], (old: User | null) =>
        old ? { ...old, twoFactorEnabled: true } : null
      );
      toast.success("2FA enabled successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "2FA verification failed");
    },
  });
};
