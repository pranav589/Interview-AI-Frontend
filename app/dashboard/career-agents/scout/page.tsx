import { Metadata } from "next";
import ScoutPageClient from "../../../../components/career-agents/scout-page-client";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const metadata: Metadata = {
  title: "Network Scout & Decision-Maker Matcher",
  description: "Map organizational leaders and recruiters at target companies.",
};

export default async function ScoutPage() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScoutPageClient />
    </HydrationBoundary>
  );
}
