"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, ExternalLink, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useClearAllNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: response, isLoading } = useNotifications();
  const notifications = response || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const readMutation = useMarkNotificationRead();
  const readAllMutation = useMarkAllNotificationsRead();
  const clearMutation = useClearAllNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative w-9 h-9 text-foreground/80 hover:bg-foreground/10 hover:text-foreground rounded-full">
          <Bell className="w-5 h-5 opacity-70" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              title="Mark all as read"
              onClick={() => readAllMutation.mutate()}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive" 
              title="Clear all"
              onClick={() => clearMutation.mutate()}
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    'flex gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors group relative',
                    !notification.isRead && 'bg-primary/5'
                  )}
                >
                  <div className="mt-1">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm leading-none mb-1', !notification.isRead ? 'font-bold' : 'font-medium')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link 
                        href={notification.link} 
                        className="text-xs text-primary flex items-center gap-1 mt-2 hover:underline"
                        onClick={() => {
                          readMutation.mutate(notification._id);
                          setIsOpen(false);
                        }}
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                      onClick={() => readMutation.mutate(notification._id)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
