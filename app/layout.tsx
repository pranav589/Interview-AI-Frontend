import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "InterviewAI — AI-Powered Interview Practice",
    template: "%s | InterviewAI",
  },
  description:
    "Practice behavioral, technical, and system design interviews with an AI interviewer. Get real-time voice interaction, per-question feedback, and score tracking.",
  keywords: [
    "interview practice",
    "AI interview",
    "mock interview",
    "behavioral interview",
    "technical interview",
    "system design interview",
  ],
  authors: [{ name: "InterviewAI" }],
  openGraph: {
    type: "website",
    title: "InterviewAI — Master Your Interviews with AI",
    description:
      "Practice real interviews with AI. Get instant, per-question feedback.",
    siteName: "InterviewAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI — AI-Powered Interview Practice",
    description:
      "Practice real interviews with AI. Get instant, per-question feedback.",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ReactQueryProvider } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { FeatureFlagsProvider } from "@/lib/feature-flags-context";
import { getQueryClient } from "@/lib/react-query";
import { prefetchFeatureFlags } from "@/lib/api-server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  // Pre-fetch Feature Flags (Independent of user session)
  await prefetchFeatureFlags(queryClient);

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        strategy="lazyOnload"
        data-domain="www.interviewai.in.net"
        data-site-id="gx_Z4uagFrM29mZ"
        src="https://ghostlyx.com/js/script.min.js"
      />
      <body className="font-sans antialiased">
        <ReactQueryProvider>
          <HydrationBoundary state={dehydratedState}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <FeatureFlagsProvider>
                <AuthProvider>
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-xl focus:font-bold"
                  >
                    Skip to main content
                  </a>
                  {children}
                </AuthProvider>
              </FeatureFlagsProvider>
            </ThemeProvider>
          </HydrationBoundary>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
