"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface RouteContainerProps {
  children: React.ReactNode;
}


export function RouteContainer({ children }: RouteContainerProps) {
  const pathname = usePathname();
  
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className={cn(
      "w-full mx-auto",
      "max-w-7xl"
    )}>
      {children}
    </div>
  );
}
