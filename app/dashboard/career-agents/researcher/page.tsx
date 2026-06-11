import { Metadata } from "next";
import ResearcherPageClient from "@/components/career-agents/researcher-page-client";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Autonomous Researcher",
  description: "Deploy deep-reasoning search loops to map live corporate intelligence.",
};

export default async function ResearcherPage() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ResearcherPageClient />
    </HydrationBoundary>
  );
}
