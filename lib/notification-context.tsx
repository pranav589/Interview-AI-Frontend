"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";

interface NotificationContextType {
  eventSource: EventSource | null;
}

const NotificationContext = createContext<NotificationContextType>({ eventSource: null });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();
  const lastToastedIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!isLoggedIn || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const connect = () => {
      if (!isActive) return;

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const sseUrl = `${apiBaseUrl.replace(/\/$/, "")}/notifications/stream`;

      // Establish EventSource with credentials (to send cookies natively)
      const eventSource = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        if (!isActive) return;
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.connected) {
            console.log("SSE notifications connection active");
            return;
          }

          if (payload.type === "JOB_UPDATED") {
            const job = payload.data;
            if (job?._id) {
              queryClient.setQueryData(["resume-job", job._id], job);
              queryClient.setQueryData(["builder-job", job._id], job);
              queryClient.invalidateQueries({ queryKey: ["resumes"] });

              if (job.status === "completed" || job.status === "failed") {
                if (job.resultRef?.analysisId) {
                  queryClient.invalidateQueries({ queryKey: ["resume-analysis", job.resultRef.analysisId] });
                  queryClient.invalidateQueries({ queryKey: ["resume-analyses"] });
                }
                if (job.resultRef?.jdMatchId) {
                  queryClient.invalidateQueries({ queryKey: ["jd-match", job.resultRef.jdMatchId] });
                  queryClient.invalidateQueries({ queryKey: ["jd-matches"] });
                }
                if (job.resultRef?.generatedResumeId) {
                  queryClient.invalidateQueries({ queryKey: ["builder-session", job.resultRef.generatedResumeId] });
                }
              }

              if (job.status === "completed") {
                let msg = "Processing completed successfully.";
                if (job.jobType === "resume-extraction") msg = "Resume details extracted successfully!";
                if (job.jobType === "resume-analysis") msg = "Resume analysis completed successfully!";
                if (job.jobType === "jd-match") msg = "Job description match completed!";
                if (job.jobType === "builder-export") msg = "Resume exported successfully!";

                toast.success(msg, {
                  id: `job-completed-${job._id}`,
                });
              } else if (job.status === "failed") {
                toast.error(job.error || "Processing failed.", {
                  id: `job-failed-${job._id}`,
                });
              }
            }
          }

          if (payload.type === "notification:new") {
            const newNotification = payload.data;
            
            // Optimistically update the notifications list
            queryClient.setQueryData<any[]>(
              ["notifications"],
              (old = []) => {
                if (old.some(n => n._id === newNotification._id)) return old;
                return [newNotification, ...old].slice(0, 50);
              }
            );
            
            // Show a single global toast with unique ID to prevent duplicates
            if (lastToastedIdRef.current !== newNotification._id) {
              lastToastedIdRef.current = newNotification._id;
              toast(newNotification.title, {
                id: `notification-${newNotification._id}`,
                description: newNotification.message,
                icon: <Bell className="w-4 h-4 text-primary" />,
                action: newNotification.link ? {
                  label: "View",
                  onClick: () => window.location.href = newNotification.link!
                } : undefined,
              });
            }
          }

          if (payload.type === "notification:read") {
            queryClient.setQueryData<any[]>(
              ["notifications"],
              (old = []) => old.map((n) => n._id === payload.data.id ? { ...n, isRead: true } : n)
            );
          }

          if (payload.type === "notification:read-all") {
            queryClient.setQueryData<any[]>(
              ["notifications"],
              (old = []) => old.map((n) => ({ ...n, isRead: true }))
            );
          }

          if (payload.type === "notification:clear") {
            queryClient.setQueryData(["notifications"], []);
          }
        } catch (err) {
          console.error("Failed to parse notification", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("Notification EventSource error:", err);
        if (isActive) {
          // Sync any potentially missed notifications while disconnected/reconnecting
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      };
    };

    connect();

    return () => {
      isActive = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isLoggedIn, user?.id, queryClient]);

  return (
    <NotificationContext.Provider value={{ eventSource: eventSourceRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
};
