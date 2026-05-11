'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/common/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, Chrome } from 'lucide-react';
import { toast } from 'sonner';

import { MESSAGES } from '@/lib/constants';

import { useMutation } from '@tanstack/react-query';

const GOOGLE_AUTH_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}auth/google`

export default function SigninForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      return login(email, password, show2FA ? twoFactorCode : undefined);
    },
    onSuccess: (response) => {
      if (response.twoFactorRequired) {
        setShow2FA(true);
        toast.info(MESSAGES.AUTH.TWO_FACTOR_REQUIRED);
        return;
      }
      toast.success(MESSAGES.AUTH.SIGNIN_SUCCESS);
      router.push('/dashboard');
    },
    onError: (err: any) => {
      const msg = err.message || MESSAGES.AUTH.SIGNIN_FAILED;
      toast.error(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleGoogleLogin = () => {
    // Redirect to backend google auth endpoint
    window.location.href = GOOGLE_AUTH_ENDPOINT
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Sign in to your account to continue your interview prep
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {loginMutation.error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                  >
                    {loginMutation.error instanceof Error ? loginMutation.error.message : MESSAGES.AUTH.ERROR_OCCURRED}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {!show2FA ? (
                    <motion.div
                      key="login-fields"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loginMutation.isPending}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loginMutation.isPending}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="2fa-field"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 pt-2"
                    >
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <ShieldCheck className="w-5 h-5" />
                          <span>Two-Factor Authentication</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Please enter the 6-digit code from your authenticator app to complete the login process.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="2fa-code" className="sr-only">Code</Label>
                          <Input
                            id="2fa-code"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            placeholder="000 000"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            disabled={loginMutation.isPending}
                            className="h-12 text-center text-xl tracking-[0.5em] font-mono"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShow2FA(false)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        &larr; Use different credentials
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full h-11  text-base  text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {show2FA ? 'Verifying...' : 'Signing in...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      {show2FA ? 'Verify & Continue' : 'Sign In'}
                    </span>
                  )}
                </Button>

                {!show2FA && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 bg-background text-muted-foreground font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 font-medium gap-3"
                      onClick={handleGoogleLogin}
                      disabled={loginMutation.isPending}
                    >
                      <Chrome className="w-5 h-5" />
                      Google Account
                    </Button>
                  </>
                )}

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-primary hover:underline font-extrabold">
                    Create one now
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
