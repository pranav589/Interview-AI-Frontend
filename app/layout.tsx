import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'InterviewAI — AI-Powered Interview Practice',
    template: '%s | InterviewAI',
  },
  description: 'Practice behavioral, technical, and system design interviews with an AI interviewer. Get real-time voice interaction, per-question feedback, and score tracking.',
  keywords: ['interview practice', 'AI interview', 'mock interview', 'behavioral interview', 'technical interview', 'system design interview'],
  authors: [{ name: 'InterviewAI' }],
  openGraph: {
    type: 'website',
    title: 'InterviewAI — Master Your Interviews with AI',
    description: 'Practice real interviews with AI. Get instant, per-question feedback.',
    siteName: 'InterviewAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InterviewAI — AI-Powered Interview Practice',
    description: 'Practice real interviews with AI. Get instant, per-question feedback.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { ReactQueryProvider } from '@/components/providers'
import { ThemeProvider } from '@/components/theme-provider'
import { FeatureFlagsProvider } from '@/lib/feature-flags-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ReactQueryProvider>
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
        </ReactQueryProvider>
      </body>
    </html>
  )
}
