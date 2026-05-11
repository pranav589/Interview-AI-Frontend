"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobDownload } from "@/hooks/use-job-download";

export function DownloadJobHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const jobId = useMemo(() => searchParams.get("downloadJob"), [searchParams]);

  useJobDownload({
    jobId,
    enabled: Boolean(jobId),
    pendingMessage: "Preparing your export. Download will start automatically.",
    successMessage: "Your export is ready and download started.",
    onSuccess: () => {
      if (!jobId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.delete("downloadJob");
      const nextUrl = params.toString() ? `/dashboard?${params.toString()}` : "/dashboard";
      router.replace(nextUrl);
    },
  });

  return null;
}
