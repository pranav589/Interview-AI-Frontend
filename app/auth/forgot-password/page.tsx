'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/common/navbar';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';

import { useMutation } from '@tanstack/react-query';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      await forgotPassword(email);
    },
    onSuccess: () => {
      setIsSuccess(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate();
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
            <CardHeader className="space-y-2">
              <div className="flex justify-between items-center">
                <NextLink href="/auth/signin" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back
                </NextLink>
              </div>
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <CardDescription>
                We'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="space-y-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                  </div>
                  <NextLink href="/auth/signin">
                    <Button className="w-full">Return to Sign In</Button>
                  </NextLink>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {forgotPasswordMutation.error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                      {forgotPasswordMutation.error instanceof Error ? forgotPasswordMutation.error.message : 'An error occurred'}
                    </div>
                  )}

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
                        disabled={forgotPasswordMutation.isPending}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? 'Sending link...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
