"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/common/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useSidebar } from "@/components/common/sidebar-context";

interface RouteContainerProps {
  children: React.ReactNode;
}

export function RouteContainer({ children }: RouteContainerProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const { isCollapsed } = useSidebar();

  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "w-full mx-auto transition-all duration-300",
          isCollapsed ? "md:ml-16" : "md:ml-64",
        )}
      >
        {children}
      </div>
    </div>
  );
}
