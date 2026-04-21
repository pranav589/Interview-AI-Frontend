import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mic,
  BarChart3,
  Brain,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

import { HeroContent, HeroBackground } from "./hero-content";
import { FadeInWhenVisible, HoverCardWrapper } from "./animated-sections";

export default function LandingPage() {
  const steps = [
    {
      title: "Set Up Your Interview",
      description:
        "Choose type, difficulty, and upload your resume for a tailored experience.",
      icon: Settings,
    },
    {
      title: "Practice with AI",
      description:
        "Engage in a real-time voice conversation with our advanced AI interviewer.",
      icon: Mic,
    },
    {
      title: "Get Detailed Feedback",
      description:
        "Receive per-question scoring, model answers, and specific improvement tips.",
      icon: Brain,
    },
    {
      title: "Track Your Progress",
      description:
        "Monitor your growth with a comprehensive dashboard and trend analytics.",
      icon: BarChart3,
    },
  ];

  const features = [
    {
      icon: Mic,
      title: "Voice-Based Practice",
      description:
        "Conduct realistic interviews with AI using voice interactions",
    },
    {
      icon: Brain,
      title: "AI-Powered Feedback",
      description:
        "Get instant, detailed feedback on your performance and speaking skills",
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description:
        "Track your progress with comprehensive metrics and analytics",
    },
    {
      icon: Zap,
      title: "Multiple Interview Types",
      description:
        "Practice behavioral, technical, and system design interviews",
    },
    {
      icon: Users,
      title: "Real-World Scenarios",
      description:
        "Interview with diverse question sets based on real job interviews",
    },
    {
      icon: ArrowRight,
      title: "Career Growth",
      description:
        "Improve your skills and land your dream job with confidence",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <HeroBackground />
        <HeroContent />
      </section>

      {/* Features Section */}
      <section 
        className="px-4 py-24 sm:px-6 lg:px-8 bg-muted/30"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px', contain: 'layout paint' }}
      >
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why Choose InterviewAI?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools designed to help you succeed in your
                interviews
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeInWhenVisible key={`feature-${index}`} delay={index * 0.05}>
                  <HoverCardWrapper>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-primary/5 hover:border-primary/20 bg-background/50 backdrop-blur-sm">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </HoverCardWrapper>
                </FadeInWhenVisible>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        className="px-4 py-24 sm:px-6 lg:px-8"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px', contain: 'layout paint' }}
      >
        <div className="max-w-7xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Get ready for your dream job in four simple steps
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <FadeInWhenVisible key={`step-${index}`} delay={index * 0.1}>
                    <div className="bg-background border border-border p-8 rounded-2xl h-full shadow-sm hover:shadow-md transition-shadow relative z-10">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-6 mx-auto lg:mx-0">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-center lg:text-left">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-center lg:text-left">
                        {step.description}
                      </p>
                    </div>
                  </FadeInWhenVisible>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="px-4 py-24 sm:px-6 lg:px-8"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 300px', contain: 'layout paint' }}
      >
        <FadeInWhenVisible>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-3xl p-12 text-center border border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have improved their interview
              skills with InterviewAI. Start practicing today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="px-10 h-14 text-lg">
                  {" "}
                  Get Started Now{" "}
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 h-14 text-lg"
                >
                  {" "}
                  View Demo{" "}
                </Button>
              </Link>
            </div>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                InterviewAI
              </span>
              <p className="text-muted-foreground text-sm text-center sm:text-left">
                Empowering candidates to master their interview skills with AI.
              </p>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2025 InterviewAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper icons
function Settings(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 0-2-2H2" />
      <circle cx="12" cy="12" r="3" />
      <path d="m19 9 1.25-1.25a2 2 0 0 0 0-2.83l-.17-.17a2 2 0 0 0-2.83 0L16 6" />
      <path d="m14.41 10.33 3.5-3.5" />
      <path d="m9 15-1.25 1.25a2 2 0 0 0 0 2.83l.17.17a2 2 0 0 0 2.83 0L12 18" />
      <path d="m9.59 13.67-3.5 3.5" />
      <path d="M15 9l1.25-1.25a2 2 0 0 1 2.83 0l.17.17a2 2 0 0 1 0 2.83L18 12" />
      <path d="m13.67 9.59 3.5 3.5" />
      <path d="m9 19-1.25 1.25a2 2 0 0 1-2.83 0l-.17-.17a2 2 0 0 1 0-2.83L6 16" />
      <path d="m10.33 14.41-3.5 3.5" />
    </svg>
  );
}
