'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/common/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import NextLink from 'next/link';

import { useMutation } from '@tanstack/react-query';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();

  const verifyEmailMutation = useMutation({
    mutationFn: async (tokenStr: string) => {
      await verifyEmail(tokenStr);
    },
    onSuccess: () => {
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    }
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  const status = !token ? 'error' : (verifyEmailMutation.isPending || verifyEmailMutation.isIdle) ? 'loading' : verifyEmailMutation.isSuccess ? 'success' : 'error';
  const errorMessage = !token ? 'Verification token is missing. Please check your email link.' : verifyEmailMutation.error instanceof Error ? verifyEmailMutation.error.message : 'Email verification failed. The link may be expired or invalid.';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="text-center">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Email Verification</CardTitle>
              <CardDescription>
                Verifying your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <AnimatePresence mode="wait">
                {status === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 pt-4"
                  >
                    <div className="flex justify-center">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    </div>
                    <p className="text-muted-foreground animate-pulse font-medium">
                      Completing verification...
                    </p>
                  </motion.div>
                )}

                {status === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 pt-4"
                  >
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Verification Complete!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your email has been verified. You can now access your account.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Redirecting to sign in page...
                    </p>
                    <NextLink href="/auth/signin">
                      <Button className="w-full">Sign In Now</Button>
                    </NextLink>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 pt-4"
                  >
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center text-destructive">
                        <XCircle className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-destructive">Verification Failed</h3>
                      <p className="text-sm text-muted-foreground">
                        {errorMessage}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <NextLink href="/auth/signup">
                        <Button variant="outline" className="w-full">Try Signing Up Again</Button>
                      </NextLink>
                      <NextLink href="/contact">
                        <Button variant="ghost" className="w-full text-xs">Need Help? Contact Support</Button>
                      </NextLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
