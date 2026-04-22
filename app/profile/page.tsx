import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import ProfilePage from "@/components/profile/profile-page";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import AuthWrapper from "@/components/auth/auth-wrapper";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account settings, resume, and preferences.",
};

export default function Profile() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfilePage />
          </Suspense>
        </div>
      </AuthWrapper>
    </HydrationBoundary>
  );
}
