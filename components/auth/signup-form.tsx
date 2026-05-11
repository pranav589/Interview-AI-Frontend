'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/common/navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { MESSAGES } from '@/lib/constants';

export default function SignupForm() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async () => {
      await signup(name, email, password);
    },
    onSuccess: () => {
      setIsSuccess(true);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError(MESSAGES.AUTH.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    if (password.length < 6) {
      setValidationError(MESSAGES.AUTH.PASSWORD_MIN_LENGTH);
      return;
    }

    signupMutation.mutate();
  };

  const displayError = validationError || (signupMutation.error instanceof Error ? signupMutation.error.message : '');

  // Keep rendering mostly the same but use the new states

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
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-extrabold tracking-tight">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Join our community and master your interview skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 py-8 text-center"
                  >
                    <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Mail className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Check your inbox!</h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent an email to <span className="font-bold text-foreground">{email}</span>.
                        Please click the verification link to activate your account.
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                      <Link href="/auth/signin">
                        <Button className="w-full h-11 gap-2 font-bold">
                          Go to Sign In <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground pt-4">
                        Didn't receive the email? <button onClick={() => setIsSuccess(false)} className="text-primary hover:underline font-bold">Try alternative email</button>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {displayError && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-shake">
                          {displayError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={signupMutation.isPending}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>

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
                            disabled={signupMutation.isPending}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              disabled={signupMutation.isPending}
                              className="pl-10 h-11 text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={signupMutation.isPending}
                              className="pl-10 h-11 text-xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 gap-2 mt-4 text-white text-base font-bold"
                        disabled={signupMutation.isPending}
                      >
                        {signupMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Building profile...
                          </span>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Create My Account
                          </>
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground pt-3">
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-primary hover:underline font-extrabold">
                          Sign in
                        </Link>
                      </p>
                    </form>
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

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
