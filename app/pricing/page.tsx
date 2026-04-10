import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/common/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Choose the best plan for your interview preparation.",
};

const PricingPageClient = dynamic(
  () => import("@/components/pricing/pricing-page-client"),
  {
    loading: () => (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 space-y-12 animate-pulse">
          <div className="space-y-4 text-center">
            <Skeleton className="h-16 w-1/2 mx-auto" />
            <Skeleton className="h-8 w-1/3 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[600px] w-full rounded-2xl" />
              ))}
          </div>
        </div>
      </div>
    ),
  },
);

export default function PricingPage() {
  return <PricingPageClient />;
}
