"use client";

import Link from "next/link";
import { 
  Mic, 
  BarChart3, 
  Brain, 
  Zap, 
  Users, 
  ArrowRight, 
  Settings,
  Target,
  Sparkles,
  Shield,
  MessageSquare
} from "lucide-react";
import { Hero2 } from "@/components/ui/hero-2-1";
import { 
  FadeInWhenVisible, 
  HoverCardWrapper, 
  ParallaxWrapper, 
  RevealText, 
  ScrollProgress, 
  AnimatedConnectionLine,
  ScaleInWhenVisible
} from "./animated-sections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LandingPage() {
  const steps = [
    {
      title: "Set Up Your Interview",
      description: "Choose type, difficulty, and upload your resume for a tailored experience.",
      icon: Settings,
    },
    {
      title: "Practice with AI",
      description: "Engage in a real-time voice conversation with our advanced AI interviewer.",
      icon: Mic,
    },
    {
      title: "Get Detailed Feedback",
      description: "Receive per-question scoring, model answers, and specific improvement tips.",
      icon: Brain,
    },
    {
      title: "Track Your Progress",
      description: "Monitor your growth with a comprehensive dashboard and trend analytics.",
      icon: BarChart3,
    },
  ];

  const features = [
    {
      icon: Mic,
      title: "Voice-Based Practice",
      description: "Conduct realistic interviews with AI using voice interactions that feel like the real thing.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Brain,
      title: "AI-Powered Feedback",
      description: "Get instant, detailed feedback on your performance, technical accuracy, and speaking skills.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "ATS Resume Analysis",
      description: "Optimize your resume for applicant tracking systems with our built-in intelligence engine.",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: Zap,
      title: "Multiple Domains",
      description: "Practice behavioral, technical, and system design interviews across all major industries.",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: Users,
      title: "Real-World Scenarios",
      description: "Interview with diverse question sets modeled after real hiring loops at top tech firms.",
      color: "from-red-500 to-rose-400"
    },
    {
      icon: Sparkles,
      title: "JD Matcher",
      description: "See how well you match specific job descriptions and get tips to close the gap.",
      color: "from-indigo-500 to-blue-500"
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      <ScrollProgress />
      
      {/* Hero Section */}
      <Hero2 />

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <RevealText 
              text="Engineered for Success" 
              className="text-4xl md:text-6xl font-bold mb-6 justify-center tracking-tighter"
            />
            <FadeInWhenVisible delay={0.2}>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                Our suite of AI tools covers every stage of your interview preparation journey.
              </p>
            </FadeInWhenVisible>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <FadeInWhenVisible key={index} delay={index * 0.1} direction="up">
                  <HoverCardWrapper>
                    <div className="group relative h-full p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-500">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                      <p className="text-gray-400 leading-relaxed font-light">
                        {feature.description}
                      </p>
                      
                      {/* Decorative corner glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </HoverCardWrapper>
                </FadeInWhenVisible>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <RevealText 
              text="Your Path to the Offer" 
              className="text-4xl md:text-6xl font-bold mb-6 justify-center tracking-tighter"
            />
            <FadeInWhenVisible delay={0.2}>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                A structured approach to mastering the art of the interview.
              </p>
            </FadeInWhenVisible>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <FadeInWhenVisible key={index} delay={index * 0.15} direction="up">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-black text-2xl mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {index + 1}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-gray-400 font-light leading-relaxed">
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

      {/* Social Proof / Stats */}
      <section className="py-24 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Interviews Conducted", value: "50k+" },
              { label: "Success Rate", value: "94%" },
              { label: "AI Accuracy", value: "99.2%" },
              { label: "User Rating", value: "4.9/5" },
            ].map((stat, i) => (
              <ScaleInWhenVisible key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{stat.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              </ScaleInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-4 bg-black overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeInWhenVisible direction="none">
            <div className="relative p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 text-center">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-8" />
              <p className="text-3xl md:text-4xl font-medium mb-12 italic leading-tight tracking-tight">
                "InterviewAI was the single most important tool in my job search. The voice feedback helped me fix verbal tics I didn't even know I had."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                <div className="text-left">
                  <div className="font-bold text-xl">Sarah Jenkins</div>
                  <div className="text-gray-500 font-light">Software Engineer @ Google</div>
                </div>
              </div>
              
              {/* Background glow for testimonial */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeInWhenVisible direction="up">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter leading-tight">
              Ready to Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Dream Career?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
              Don't leave your future to chance. Practice with the world's most advanced AI interviewer today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <button className="h-16 px-12 rounded-full bg-white text-black font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                  Get Started Free
                </button>
              </Link>
              <Link href="/auth/signin">
                <button className="h-16 px-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-bold text-xl hover:scale-105 active:scale-95 transition-all hover:bg-white/10">
                  Login to Account
                </button>
              </Link>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">AI</div>
                <span className="text-2xl font-black tracking-tighter">InterviewAI</span>
              </div>
              <p className="text-gray-500 font-light max-w-xs">
                Empowering the next generation of tech talent with sophisticated AI prep tools.
              </p>
            </div>
            
            <div className="flex gap-12 text-sm font-medium text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-xs text-gray-600 tracking-widest uppercase">
            © 2025 INTERVIEWAI. BUILT FOR THE FUTURE.
          </div>
        </div>
      </footer>
    </div>
  );
}
