"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Sparkles,
  Zap,
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
import { SUBSCRIPTION_TIERS, DEFAULT_FREE_CREDITS } from "@/lib/constants";

export function Navbar() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-black bg-gradient-to-br from-primary via-primary/80 to-violet-500 bg-clip-text text-transparent tracking-tighter"
            >
              InterviewAI
            </motion.div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 min-w-[36px]">
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative w-9 h-9 rounded-full hover:bg-primary/5 transition-colors"
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
                      <Sun className="h-[1.1rem] w-[1.1rem]" />
                    ) : (
                      <Moon className="h-[1.1rem] w-[1.1rem]" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            ) : (
              <div className="w-9 h-9" />
            )}

            {isLoggedIn ? (
              <>
                {/* <Link href="/interview-setup" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold tracking-tight">
                      Quick Start
                    </span>
                  </Button>
                </Link> */}
                <div className="hidden md:flex items-center gap-4">
                  <a href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Dashboard
                    </Button>
                  </a>
                  {/* <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="font-medium text-muted-foreground hover:text-foreground">
                      Pricing
                    </Button>
                  </Link> */}

                  {/* Credit Indicator */}
                  {/* {user?.subscriptionTier === SUBSCRIPTION_TIERS.FREE && (
                    <Link href="/pricing" className="flex items-center">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 hover:bg-amber-500/20 transition-all cursor-pointer">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold leading-none">{user.credits}/{DEFAULT_FREE_CREDITS} Credits</span>
                      </div>
                    </Link>
                  )}
                  {user?.subscriptionTier === SUBSCRIPTION_TIERS.PRO && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold leading-none">PRO</span>
                    </div>
                  )} */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-9 h-9 border border-primary/10"
                        aria-label="User account menu"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 pointer-events-none border-b mb-1">
                        <span className="font-bold text-sm">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {user?.email}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings"
                          className="cursor-pointer py-2.5"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings & Security</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive py-2.5"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9"
                        aria-label="Open mobile navigation menu"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] p-0">
                      <SheetHeader className="p-6 text-left border-b bg-muted/20">
                        <SheetTitle className="text-xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          InterviewAI
                        </SheetTitle>
                      </SheetHeader>
                      <div className="p-6 space-y-2">
                        <div className="flex flex-col gap-1 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="font-bold text-sm">
                            {user?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>

                        <a href="/dashboard" className="block">
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-12 text-base font-medium gap-3"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Button>
                        </a>
                        {/* <Link href="/pricing" className="block">
                          <Button variant="ghost" className="w-full justify-start h-12 text-base font-medium gap-3">
                            <ShieldCheck className="w-5 h-5" />
                            Pricing & Plans
                          </Button>
                        </Link> */}
                        <Link href="/dashboard/settings" className="block">
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-12 text-base font-medium gap-3"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Settings & Security
                          </Button>
                        </Link>
                        <div className="pt-4 mt-4 border-t">
                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start h-12 text-base font-medium gap-3 text-destructive hover:bg-destructive/5"
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
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="px-3">
                    Sign In
                  </Button>
                </Link>
                {/* <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="px-4 shadow-md shadow-primary/20"
                  >
                    Get Started
                  </Button>
                </Link> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
