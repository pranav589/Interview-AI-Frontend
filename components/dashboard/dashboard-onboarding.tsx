"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { useSuspenseInterviewStats } from "@/hooks/use-interviews";
import { useCompleteOnboarding } from "@/hooks/use-user";
import { FeatureFlag } from "@/components/common/feature-flag";
import { MESSAGES } from "@/lib/constants";

const OnboardingWizard = dynamic(
  () => import("./onboarding-wizard").then((mod) => mod.OnboardingWizard),
  {
    ssr: false,
  },
);

export function DashboardOnboarding() {
  const { user } = useAuth();
  const { data: statsData } = useSuspenseInterviewStats();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const completeOnboarding = useCompleteOnboarding();

  useEffect(() => {
    if (!statsData || !user) return;

    // Show only if not completed and user has no completed interviews
    if (!user.onboardingCompleted && statsData.totalInterviews === 0) {
      setShowOnboarding(true);
    }
  }, [statsData, user]);

  const handleCloseOnboarding = async () => {
    try {
      await completeOnboarding.mutateAsync();
      setShowOnboarding(false);
    } catch (err) {
      console.error(MESSAGES.ONBOARDING.COMPLETE_FAILED, err);
      // Fallback to local storage if API fails
      localStorage.setItem("onboarding_completed", "true");
      setShowOnboarding(false);
    }
  };

  return (
    <FeatureFlag name="onboarding_enabled">
      {showOnboarding && (
        <OnboardingWizard
          isOpen={showOnboarding}
          onClose={handleCloseOnboarding}
        />
      )}
    </FeatureFlag>
  );
}
