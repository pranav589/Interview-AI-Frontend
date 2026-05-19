"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  Plus,
  FileText,
  FileCheck,
  FolderHeart,
  Settings,
  Coins,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/common/sidebar-context";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();
  const { isCollapsed, toggleCollapse } = useSidebar();

  // If user is not logged in, or we are on the landing/auth pages, do not render sidebar
  if (!isLoggedIn || pathname === "/" || pathname.startsWith("/auth")) {
    return null;
  }

  // Active mock room: maximize focus, do not render sidebar
  if (pathname.startsWith("/interview-room")) {
    return null;
  }

  const sections: SidebarSection[] = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Mock Interview",
          href: "/interview-setup",
          icon: Sparkles,
          badge: "New",
        },
      ],
    },
    {
      title: "Resume Hub",
      items: [
        {
          name: "Resume Builder",
          href: "/resume/builder",
          icon: Plus,
        },
        {
          name: "ATS Analyzer",
          href: "/resume/analyzer",
          icon: FileText,
        },
        {
          name: "JD Matcher",
          href: "/resume/jd-match",
          icon: FileCheck,
        },
        {
          name: "Resume Vault",
          href: "/resume/vault",
          icon: FolderHeart,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          name: "Settings & Security",
          href: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "fixed top-[52px] left-0 bottom-0 z-40 border-r border-hairline bg-parchment/60 backdrop-blur-xl saturate-180 select-none hidden md:flex flex-col py-6 transition-all duration-300 ease-in-out",
          isCollapsed
            ? "w-16 px-2 justify-between"
            : "w-64 px-4 justify-between",
        )}
      >
        {/* Sleek Floating border toggle button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-6 -right-3 bg-white dark:bg-ink border border-hairline rounded-full p-1 shadow-md hover:bg-ink/5 dark:hover:bg-white/10 z-50 text-ink/60 hover:text-ink transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-300",
              !isCollapsed && "rotate-180",
            )}
          />
        </button>

        <div className="flex flex-col gap-5 overflow-y-auto pr-[1px] scrollbar-none">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              {isCollapsed ? (
                <div className="h-px bg-ink/10 dark:bg-white/10 my-2 mx-1 opacity-70" />
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink/40 px-3 mb-1">
                  {section.title}
                </span>
              )}
              <div className="space-y-[2px]">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  const linkContent = (
                    <Link
                      href={item.href}
                      key={item.name}
                      className="block group"
                    >
                      <div
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          isCollapsed ? "justify-center" : "justify-between",
                          isActive
                            ? "text-primary font-semibold bg-primary/5 shadow-sm"
                            : "text-ink/60 hover:text-ink hover:bg-ink/5",
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-sidebar-pill"
                            className="absolute inset-0 bg-primary/5 rounded-lg -z-10"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105",
                              isActive
                                ? "text-primary"
                                : "text-ink/40 group-hover:text-ink/60",
                            )}
                          />
                          {!isCollapsed && (
                            <span className="text-[13px] font-medium">
                              {item.name}
                            </span>
                          )}
                        </div>
                        {!isCollapsed &&
                          (item.badge ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                              {item.badge}
                            </span>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity duration-200 text-ink/40" />
                          ))}
                      </div>
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.name} delayDuration={50}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-ink text-white dark:bg-white dark:text-ink px-2.5 py-1.5 rounded-md border border-hairline shadow-md text-xs font-semibold"
                        >
                          {item.name} {item.badge && `(${item.badge})`}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Credit & User card at the bottom */}
        <div className="flex flex-col gap-3 pt-4 border-t border-hairline mt-auto">
          {isCollapsed ? (
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center p-3 rounded-xl bg-ink/5 dark:bg-white/5 border border-hairline hover:bg-ink/10 dark:hover:bg-white/10 cursor-pointer transition-all duration-200 mx-1">
                  <Coins className="w-5 h-5 text-primary animate-pulse" />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="flex flex-col gap-1 p-3 bg-parchment/95 dark:bg-ink/95 backdrop-blur-xl border border-hairline text-ink dark:text-white shadow-xl min-w-[150px]"
              >
                <div className="flex items-center gap-1.5 border-b border-hairline pb-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-white/50">
                    Credits
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-ink dark:text-white">
                    {user?.credits !== undefined ? user.credits : 0}
                  </span>
                  <span className="text-[10px] text-ink/40 dark:text-white/40">
                    credits
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-1">
                  {user?.subscriptionTier || "Free Tier"} Plan
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="bg-ink/5 dark:bg-ink/10 rounded-xl p-3 border border-hairline flex flex-col gap-2 relative overflow-hidden group hover:bg-ink/10 transition-all duration-200">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-12 h-12 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                  Credits Remaining
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-ink">
                  {user?.credits !== undefined ? user.credits : 0}
                </span>
                <span className="text-caption text-ink/40 font-normal">
                  credits
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-ink-muted-48 truncate">
                  {user?.subscriptionTier || "Free Tier"} Plan
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
