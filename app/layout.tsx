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
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
