"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationContextType {
  socket: WebSocket | null;
}

const NotificationContext = createContext<NotificationContextType>({ socket: null });

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastToastedIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!isLoggedIn || !user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      return;
    }

    const connect = () => {
      if (!isActive) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
      const socket = new WebSocket(`${wsUrl}?context=global_notifications`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        if (!isActive) return;
        try {
          const payload = JSON.parse(event.data);
          
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

      socket.onclose = () => {
        if (isActive && isLoggedIn) {
          // Invalidate to sync any missed events during disconnect
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isActive) connect();
          }, 5000);
        }
      };

      socket.onerror = (err) => {
        console.error("Notification socket error:", err);
      };
    };

    connect();

    return () => {
      isActive = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isLoggedIn, user?.id, queryClient]);

  return (
    <NotificationContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </NotificationContext.Provider>
  );
};
