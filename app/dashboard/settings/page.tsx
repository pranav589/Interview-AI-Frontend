import { Metadata } from "next";
import SettingsPageClient from "@/components/dashboard/settings-page-client";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AuthWrapper from "@/components/auth/auth-wrapper";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account security and preferences.",
};

export default async function Settings() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuthWrapper>
        <SettingsPageClient />
      </AuthWrapper>
    </HydrationBoundary>
  );
}
