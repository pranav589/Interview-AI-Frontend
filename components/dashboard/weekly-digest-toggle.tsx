'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useUpdateSettings } from '@/hooks/use-user';

interface WeeklyDigestToggleProps {
  initialValue?: boolean;
}

export function WeeklyDigestToggle({ initialValue = true }: WeeklyDigestToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const { mutate, isPending } = useUpdateSettings();

  const handleToggle = (checked: boolean) => {
    mutate({ weeklyEmailDigest: checked }, {
      onSuccess: () => {
        setEnabled(checked);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
             <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium uppercase tracking-wider">Communication</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-base font-semibold">Weekly Performance Digest</h4>
            <p className="text-sm text-muted-foreground">
              Receive a summary of your progress and peak performance times every Monday.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <Switch 
              checked={enabled} 
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
          </div>
        </div>
        
        {enabled && (
             <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                   Your next digest will be sent on <strong>Monday, April 13th</strong>. It will include your trend analysis and areas for improvement.
                </p>
             </div>
        )}
      </CardContent>
    </Card>
  );
}
