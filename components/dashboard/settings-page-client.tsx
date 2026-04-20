"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/common/navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  QrCode,
  Lock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";

export default function SettingsPageClient() {
  const { user, setup2FA, verify2FA } = useAuth();
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      return await setup2FA();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.otpAuthUrl);
      setIsSettingUp2FA(true);
      toast.info("2FA Setup started. Please scan the QR code.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start 2FA setup");
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async () => {
      if (twoFactorCode.length < 6)
        throw new Error("Please enter a 6-digit code");
      await verify2FA(twoFactorCode);
    },
    onSuccess: () => {
      setIsSettingUp2FA(false);
      setTwoFactorCode("");
      toast.success("Two-factor authentication enabled successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Verification failed. Please try again.");
    },
  });

  const handleStartSetup = () => {
    setup2FAMutation.mutate();
  };

  const handleVerify2FA = () => {
    verify2FAMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Account Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account security and preferences
            </p>
          </div>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Security & Authentication
                </CardTitle>
                <CardDescription>
                  Protect your account with additional security layers
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border bg-muted/30">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    {user?.twoFactorEnabled ? (
                      <span className="text-emerald-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" /> 2FA Enabled
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-5 h-5" /> 2FA Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Add an extra layer of security to your account. When
                    enabled, you'll be asked for a code from your
                    authenticator app during login.
                  </p>
                </div>

                {!user?.twoFactorEnabled && !isSettingUp2FA && (
                  <Button
                    onClick={handleStartSetup}
                    disabled={setup2FAMutation.isPending}
                    className="h-12 px-8 font-bold text-base shadow-lg shadow-primary/20"
                  >
                    {setup2FAMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Shield className="w-5 h-5 mr-2" />
                    )}
                    Enable 2FA
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {isSettingUp2FA && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 border-2 border-dashed rounded-3xl space-y-8 bg-card shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                              1
                            </div>
                            <h3 className="text-xl font-extrabold">
                              Scan QR Code
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Open your authenticator app (like Google
                            Authenticator, Authy, or Microsoft Authenticator)
                            and scan this QR code to add your account.
                          </p>
                          <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border-4 border-muted">
                            {qrCodeUrl ? (
                              <QRCodeSVG
                                value={qrCodeUrl}
                                size={192}
                                level="H"
                                includeMargin={false}
                              />
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-lg">
                                <QrCode className="w-32 h-32 text-gray-300 animate-pulse" />
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground break-all max-w-[200px] font-mono mt-2 pt-2 border-t">
                            {qrCodeUrl}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                              2
                            </div>
                            <h3 className="text-xl font-extrabold">
                              Enter Verification Code
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Once scanned, your app will display a 6-digit
                            code. Enter it here to confirm your setup.
                          </p>
                          <div className="space-y-4">
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                placeholder="000 000"
                                value={twoFactorCode}
                                onChange={(e) =>
                                  setTwoFactorCode(e.target.value)
                                }
                                className="h-16 pl-12 text-2xl tracking-[0.5em] font-mono font-bold"
                                maxLength={6}
                              />
                            </div>
                            <div className="flex gap-4">
                              <Button
                                onClick={handleVerify2FA}
                                disabled={verify2FAMutation.isPending}
                                className="flex-1 h-14 font-extrabold text-lg shadow-xl shadow-primary/20"
                              >
                                {verify2FAMutation.isPending
                                  ? "Verifying..."
                                  : "Confirm & Enable"}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setIsSettingUp2FA(false)}
                                className="h-12"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
