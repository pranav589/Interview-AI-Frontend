import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  Cpu, 
  Shield, 
  BarChart3 
} from "lucide-react";
import { 
  FadeInWhenVisible, 
  RevealText, 
  HoverCardWrapper 
} from "./animated-sections";

export function FeaturesSection() {
  const features = [
    {
      title: "AI Voice Interviews",
      description: "Engage in realistic, real-time voice conversations with our advanced AI interviewer modeled after top tech recruiters.",
      icon: Zap,
      color: "from-blue-500 to-cyan-400",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Precision Feedback",
      description: "Receive per-question scoring, model answers, and specific improvement tips for your technical and soft skills.",
      icon: Cpu,
      color: "from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "ATS Optimization",
      description: "Our intelligence engine analyzes your resume against industry standards to ensure you pass the initial screening.",
      icon: Shield,
      color: "from-orange-500 to-yellow-500",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Smart JD Matcher",
      description: "Upload a job description to see your match percentage and get actionable tips to close the experience gap.",
      icon: BarChart3,
      color: "from-green-500 to-emerald-400",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <section id="features" className="py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <RevealText 
              text="Master the Art of the Interview" 
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-6"
            />
            <FadeInWhenVisible delay={0.2}>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Our comprehensive AI suite covers every stage of your preparation, from resume tailoring to realistic voice practice.
              </p>
            </FadeInWhenVisible>
          </div>
          {/* <FadeInWhenVisible delay={0.4}>
            <Link href="#" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              View Documentation <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeInWhenVisible> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeInWhenVisible key={index} delay={index * 0.1} direction={index % 2 === 0 ? "left" : "right"}>
                <HoverCardWrapper>
                  <div className="group relative h-full overflow-hidden rounded-[2rem] bg-card border border-border transition-all duration-500">
                    <div className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40">
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <div className="relative z-10 p-10 flex flex-col h-full min-h-[400px]">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-3 mb-auto shadow-xl`}>
                        <Icon className="w-full h-full text-white" />
                      </div>
                      <div className="mt-8">
                        <h3 className="text-3xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed font-light text-lg">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {/* Interactive glow effect */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </HoverCardWrapper>
              </FadeInWhenVisible>
            );
          })}
        </div>
      </div>
    </section>
  );
}
