'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/common/navbar';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import NextLink from 'next/link';
import { toast } from 'sonner';

import { MESSAGES } from '@/lib/constants';

import { useMutation } from '@tanstack/react-query';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(MESSAGES.AUTH.INVALID_RESET_LINK);
    }
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('No token found');
      await resetPassword(token, password);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success(MESSAGES.AUTH.RESET_PASSWORD_SUCCESS);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    },
    onError: (err: any) => {
      toast.error(err.message || MESSAGES.AUTH.RESET_PASSWORD_FAILED);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(MESSAGES.AUTH.PASSWORD_MIN_LENGTH);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(MESSAGES.AUTH.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    if (!token) {
      toast.error('No reset token found. Please start over.');
      return;
    }

    resetPasswordMutation.mutate();
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Set a New Password</CardTitle>
              <CardDescription>
                Create a strong password to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Password Changed!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been successfully updated. Redirecting you to sign in...
                    </p>
                  </div>
                  <NextLink href="/auth/signin">
                    <Button variant="outline" className="w-full">Sign In Now</Button>
                  </NextLink>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={resetPasswordMutation.isPending}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground pt-1">Min. 6 characters</p>
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={resetPasswordMutation.isPending}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold shadow-lg"
                    disabled={resetPasswordMutation.isPending || !token}
                  >
                    {resetPasswordMutation.isPending ? 'Resetting Password...' : 'Reset Password'}
                  </Button>

                  {!token && (
                    <NextLink href="/auth/forgot-password">
                      <Button variant="ghost" className="w-full text-xs">
                        Request a new reset link
                      </Button>
                    </NextLink>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
