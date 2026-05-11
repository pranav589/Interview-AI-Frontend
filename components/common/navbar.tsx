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
} from "@/components/ui/sheet";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
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
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-caption text-ink/70 hover:text-ink hover:bg-ink/5 active:scale-95 rounded-pill"
                    >
                      Dashboard
                    </Button>
                  </Link>

                  <Link href="/resume">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-caption text-ink/70 hover:text-ink hover:bg-ink/5 active:scale-95 rounded-pill"
                    >
                      Resume Hub
                    </Button>
                  </Link>

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
                      className="w-[280px] p-0 border-l border-hairline bg-parchment/95 backdrop-blur-xl"
                    >
                      <SheetHeader className="p-6 text-left border-b border-hairline">
                        <SheetTitle className="text-left text-ink text-tagline font-semibold tracking-tight">
                          Navigation
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-1 py-6 px-4">
                        <Link href="/dashboard" className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-caption text-ink/80 hover:text-ink hover:bg-ink/5 active:scale-95 rounded-pill"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/resume" className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-caption text-ink/80 hover:text-ink hover:bg-ink/5 active:scale-95 rounded-pill"
                          >
                            <FileText className="w-5 h-5" />
                            Resume Hub
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings" className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-caption text-ink/80 hover:text-ink hover:bg-ink/5 active:scale-95 rounded-pill"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Settings & Security
                          </Button>
                        </Link>
                        <div className="pt-4 mt-4 border-t border-hairline">
                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start h-12 gap-3 text-caption text-destructive hover:text-destructive hover:bg-destructive/5 active:scale-95 rounded-pill"
                          >
                            <LogOut className="w-5 h-5" />
                            Logout
                          </Button>
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
                <Link href="/auth/signup">
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
