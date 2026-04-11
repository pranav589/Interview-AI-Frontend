"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function InterviewerCTA() {
  const { user } = useAuth();

  // Don't show if already an interviewer or application is pending
  if (user?.interviewerStatus === "approved" || user?.interviewerStatus === "pending") {
    return (
      <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Status: {user.interviewerStatus}</span>
          </div>
          <CardTitle className="text-xl">
            {user.interviewerStatus === "approved" ? "You are a Verified Interviewer!" : "Application Under Review"}
          </CardTitle>
          <CardDescription>
            {user.interviewerStatus === "approved" 
              ? "Manage your availability and help others grow." 
              : "Our AI is currently analyzing your profile. We'll notify you soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={user.interviewerStatus === "approved" ? "/interviewer/dashboard" : "#"}>
            <Button variant={user.interviewerStatus === "approved" ? "default" : "outline"} disabled={user.interviewerStatus === "pending"} className="gap-2">
              {user.interviewerStatus === "approved" ? "Manage Availability" : "Awaiting Review"}
              {user.interviewerStatus === "approved" && <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 overflow-hidden relative border-dashed border-2">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <UserCheck className="w-24 h-24" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UserCheck className="w-5 h-5 text-primary" />
          Become an Interviewer
        </CardTitle>
        <CardDescription className="max-w-md">
          Share your expertise, help candidates improve, and grow your own skills by conducting peer-to-peer interviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/interviewer/apply">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
