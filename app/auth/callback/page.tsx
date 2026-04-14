"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

import { MESSAGES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await refreshUser();

        toast.success(MESSAGES.AUTH.CALLBACK_SUCCESS);
        router.push("/dashboard");
      } catch (error) {
        toast.error("Authentication failed. Please try again.");
        router.push("/auth/signin");
      }
    };

    handleCallback();
  }, [router, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          Finalizing Google Login...
        </h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we secure your session
        </p>
      </div>
    </div>
  );
}
