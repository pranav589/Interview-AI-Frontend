"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MESSAGES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    toast.success(MESSAGES.AUTH.CALLBACK_SUCCESS);
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-bold">Finalizing Google Login...</h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we secure your session
        </p>
      </div>
    </div>
  );
}
