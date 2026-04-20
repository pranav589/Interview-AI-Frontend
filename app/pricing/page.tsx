import { Metadata } from "next";
import PricingPageClient from "@/components/pricing/pricing-page-client";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Choose the best plan for your interview preparation.",
};

export default function PricingPage() {
  // By removing the dynamic import with loading skeleton, 
  // we ensure the pricing page is fully SSR-ed and visible immediately.
  return <PricingPageClient />;
}
