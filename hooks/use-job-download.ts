"use client";

import { useEffect, useRef } from "react";
import { useResumeJob, useDownloadResumeJobArtifact } from "@/hooks/use-resume";
import { toast } from "sonner";

type UseJobDownloadOptions = {
  jobId?: string | null;
  enabled?: boolean;
  onSuccess?: () => void;
  onFailure?: () => void;
  pendingMessage?: string;
  successMessage?: string;
  failureMessage?: string;
};

const DEFAULT_FILENAME = "resume.pdf";

function getFilenameFromContentDisposition(contentDisposition?: string): string {
  if (!contentDisposition) return DEFAULT_FILENAME;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]).replace(/["']/g, "");
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];

  return DEFAULT_FILENAME;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename || DEFAULT_FILENAME);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useJobDownload({
  jobId,
  enabled = true,
  onSuccess,
  onFailure,
  pendingMessage = "Your file is still being prepared.",
  successMessage = "Download started.",
  failureMessage = "Unable to download file for this job.",
}: UseJobDownloadOptions) {
  const hasShownPendingToast = useRef(false);
  const hasTriggeredDownload = useRef(false);

  const jobQuery = useResumeJob(jobId || undefined);
  const downloadMutation = useDownloadResumeJobArtifact();

  useEffect(() => {
    if (!enabled || !jobId) return;

    const jobStatus = jobQuery.data?.status;
    if (!jobStatus) return;

    if ((jobStatus === "queued" || jobStatus === "processing") && !hasShownPendingToast.current) {
      toast.info(pendingMessage);
      hasShownPendingToast.current = true;
      return;
    }

    if (jobStatus === "failed" && !hasTriggeredDownload.current) {
      hasTriggeredDownload.current = true;
      toast.error(jobQuery.data?.error || failureMessage);
      onFailure?.();
      return;
    }

    if (jobStatus !== "completed" || hasTriggeredDownload.current || downloadMutation.isPending) {
      return;
    }

    hasTriggeredDownload.current = true;

    downloadMutation.mutate(jobId, {
      onSuccess: (response: any) => {
        const fileName = getFilenameFromContentDisposition(response?.contentDisposition);
        triggerBlobDownload(response.blob, fileName);
        toast.success(successMessage);
        onSuccess?.();
      },
      onError: (error: any) => {
        hasTriggeredDownload.current = false;
        toast.error(error?.message || failureMessage);
        onFailure?.();
      },
    });
  }, [
    jobId,
    enabled,
    jobQuery.data?.status,
    jobQuery.data?.error,
    downloadMutation.isPending,
    pendingMessage,
    successMessage,
    failureMessage,
    onSuccess,
    onFailure,
  ]);

  return {
    isPending: jobQuery.isLoading || downloadMutation.isPending || jobQuery.data?.status === "queued" || jobQuery.data?.status === "processing",
    status: jobQuery.data?.status,
    error: jobQuery.data?.error,
  };
}
