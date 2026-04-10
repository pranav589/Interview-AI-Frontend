"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
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
  CheckCircle2,
  MessageSquare,
  Star,
  Quote,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

function AnimatedStat({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold mb-1">
        {count}
        {suffix}
      </p>
      <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

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

  const testimonials = [
    {
      quote:
        "InterviewAI helped me prepare for my Google L5 interview. The system design questions were spot on.",
      author: "Sarah K.",
      role: "Software Engineer",
      seed: "Sarah",
    },
    {
      quote:
        "I went from freezing up in behavioral interviews to confidently using the STAR framework.",
      author: "Marcus L.",
      role: "Product Manager",
      seed: "Marcus",
    },
    {
      quote:
        "The per-question feedback showed me exactly where I was weak. Landed my dream job after 2 weeks of practice.",
      author: "Priya D.",
      role: "Full Stack Developer",
      seed: "Priya",
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
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20 dark:opacity-30"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, oklch(0.55 0.25 270 / 0.15) 0%, transparent 50%),
                           radial-gradient(ellipse at 70% 60%, oklch(0.65 0.2 300 / 0.1) 0%, transparent 50%)`,
            }}
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-40 right-40 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
            className="absolute bottom-40 left-40 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              ✨ Your AI Interview Coach
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-pretty"
          >
            Master Your Interviews with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Coaching
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground mb-12 text-balance max-w-2xl mx-auto"
          >
            Practice real interviews with our AI interviewer, get instant
            feedback, and build confidence for your next opportunity.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20 px-4"
          >
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start Practicing Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          {/* <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-border/50 pt-12"
          >
            <AnimatedStat value={1000} label="Interviews Practiced" suffix="+" />
            <AnimatedStat value={95} label="Success Rate" suffix="%" />
            <AnimatedStat value={50} label="Question Types" suffix="+" />
          </motion.div> */}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose InterviewAI?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to help you succeed in your
              interviews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={`feature-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="px-2"
                >
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
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get ready for your dream job in four simple steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={`step-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="px-4 py-24 sm:px-6 lg:px-8 bg-primary/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by Candidates
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Real success stories from professionals who used InterviewAI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-primary/10 bg-background/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <Quote className="w-8 h-8 text-primary/20 mb-2" />
                    <p className="text-lg italic leading-relaxed">{t.quote}</p>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`}
                        alt={t.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-3xl p-12 text-center border border-primary/20 overflow-hidden relative"
        >
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
        </motion.div>
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

// Helper icons that were missing
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
