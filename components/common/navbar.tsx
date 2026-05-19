"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Menu,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Sparkles,
  Plus,
  FileCheck,
  FolderHeart,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";
import { SUBSCRIPTION_TIERS, DEFAULT_FREE_CREDITS } from "@/lib/constants";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = [
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

  if (pathname === "/") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-[52px] border-b border-hairline bg-parchment/80 backdrop-blur-xl saturate-[180%] transition-all duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <img
                src="/logo.png"
                alt="InterviewAI Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-tagline font-semibold tracking-tight text-ink">
                InterviewAI
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative w-8 h-8 rounded-full text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors active:scale-95"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ y: -10, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 10, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.15 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-[1rem] w-[1rem]" />
                    ) : (
                      <Moon className="h-[1rem] w-[1rem]" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            ) : (
              <div className="w-8 h-8" />
            )}

            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center gap-4">
                  <NotificationBell />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-8 h-8 border border-ink/5 text-ink/80 hover:bg-ink/5 hover:text-ink active:scale-95"
                        aria-label="User account menu"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 p-2 rounded-lg border border-hairline bg-popover/95 backdrop-blur-xl shadow-apple-card"
                    >
                      <div className="flex flex-col space-y-1 p-2 border-b border-hairline mb-1">
                        <p className="text-caption-strong text-ink truncate font-medium leading-none">
                          {user?.name}
                        </p>
                        <p className="text-[12px] text-ink-muted-48 truncate leading-none">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center py-2 px-2 text-caption text-ink/80 focus:text-ink focus:bg-ink/5 rounded-md transition-colors"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings & Security</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center py-2 px-2 text-caption text-destructive focus:bg-destructive/5 rounded-md transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="md:hidden flex items-center gap-2">
                  <NotificationBell />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-ink/80 hover:bg-ink/5 hover:text-ink active:scale-95"
                        aria-label="Open mobile navigation menu"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[280px] p-0 border-l border-hairline bg-parchment/95 backdrop-blur-xl flex flex-col h-full"
                    >
                      <SheetHeader className="p-6 text-left border-b border-hairline shrink-0">
                        <SheetTitle className="text-left text-ink text-tagline font-semibold tracking-tight">
                          Navigation
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 flex flex-col gap-6 overflow-y-auto py-6 px-4 scrollbar-none">
                        {sections.map((section) => (
                          <div key={section.title} className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 px-3">
                              {section.title}
                            </span>
                            <div className="space-y-[4px]">
                              {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                  pathname === item.href ||
                                  pathname.startsWith(item.href + "/");

                                return (
                                  <SheetClose asChild key={item.name}>
                                    <Link href={item.href} className="block w-full">
                                      <Button
                                        variant="ghost"
                                        className={cn(
                                          "w-full justify-start gap-3 h-11 text-[13px] font-medium active:scale-95 rounded-lg transition-all duration-200",
                                          isActive
                                            ? "text-primary bg-primary/5 font-semibold animate-pulse-slow"
                                            : "text-ink/60 hover:text-ink hover:bg-ink/5"
                                        )}
                                      >
                                        <Icon className={cn("w-4.5 h-4.5", isActive ? "text-primary" : "text-ink/40")} />
                                        <span>{item.name}</span>
                                        {item.badge && (
                                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                                            {item.badge}
                                          </span>
                                        )}
                                      </Button>
                                    </Link>
                                  </SheetClose>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        
                        {/* Remaining Credits & Plan info inside mobile Drawer */}
                        <div className="bg-ink/5 dark:bg-white/5 rounded-xl p-3.5 border border-hairline flex flex-col gap-1.5 relative overflow-hidden mt-auto shrink-0">
                          <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Coins className="w-10 h-10 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">
                              Credits Remaining
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold tracking-tight text-ink">
                              {user?.credits !== undefined ? user.credits : 0}
                            </span>
                            <span className="text-[10px] text-ink/40 font-normal">
                              credits
                            </span>
                          </div>
                          <div className="text-[10px] font-medium text-ink-muted-48">
                            {user?.subscriptionTier || "Free Tier"} Plan
                          </div>
                        </div>

                        <div className="pt-4 border-t border-hairline shrink-0">
                          <SheetClose asChild>
                            <Button
                              variant="ghost"
                              onClick={handleLogout}
                              className="w-full justify-start h-11 gap-3 text-[13px] font-medium text-destructive hover:text-destructive hover:bg-destructive/5 active:scale-95 rounded-lg"
                            >
                              <LogOut className="w-4.5 h-4.5" />
                              Logout
                            </Button>
                          </SheetClose>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-5 text-caption text-ink/80 hover:text-ink active:scale-95 rounded-pill transition-all h-[36px]"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="hidden sm:block">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-[36px] px-6 text-caption bg-primary text-white hover:bg-primary/90 active:scale-95 rounded-pill transition-all font-medium"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
