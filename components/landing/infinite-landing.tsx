import React from "react";
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid";
import { ScrollProgress } from "./animated-sections";
import { Navbar } from "./navbar";
import { StatsSection } from "./stats-section";
import { FeaturesSection } from "./features-section";
import { IntegrationSection } from "./integration-section";
import { TestimonialsSection } from "./testimonials-section";
import { FinalCTA } from "./final-cta";
import { Footer } from "./footer";

export default function TheInfiniteLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <ScrollProgress />
      
      {/* Hero Section */}
      <section id="overview" className="relative h-screen">
        <TheInfiniteGrid />
        <Navbar />
      </section>

      {/* Stats Section */}
      {/* <StatsSection /> */}

      {/* Features Section */}
      <FeaturesSection />

      {/* Integration Showcase */}
      <IntegrationSection />

      {/* Testimonial Section */}
      {/* <TestimonialsSection /> */}

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}
