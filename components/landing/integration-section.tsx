import { 
  CheckCircle2, 
  Sparkles,
  Search,
  Globe
} from "lucide-react";
import { FadeInWhenVisible } from "./animated-sections";

export function IntegrationSection() {
  return (
    <section id="solutions" className="py-32 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeInWhenVisible direction="left">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 text-background border border-background/20 text-xs font-bold tracking-widest uppercase">
                <Sparkles className="w-4 h-4" /> Seamless Integration
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
                Connect Your <span className="text-muted-foreground">Entire Career</span> in Minutes.
              </h2>
              <p className="text-xl text-background/60 font-light leading-relaxed">
                InterviewAI is your all-in-one preparation partner. Whether you're practicing for behavioral loops, system design, or live coding, our platform provides the structure you need.
              </p>
              <ul className="space-y-4">
                {[
                  "Realistic voice-to-voice AI interaction",
                  "ATS-ready resume scoring engine",
                  "Deep-dive analytics on speaking traits",
                  "Custom practice tracks for top tech firms"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg font-medium">
                    <CheckCircle2 className="w-6 h-6 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeInWhenVisible>
          
          <FadeInWhenVisible direction="right">
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl p-8 flex flex-col justify-center gap-6">
                <div className="p-6 rounded-2xl bg-background/5 border border-white/5 space-y-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <code className="text-sm md:text-base text-background/80 font-mono block">
                    <span className="text-primary">analyze</span> --resume ./my-resume.pdf<br/>
                    <span className="text-blue-400">matching</span> job description <span className="text-blue-400">to</span> <span className="text-green-400">"Software Engineer"</span>;<br/><br/>
                    <span className="text-gray-500">// Start practice session</span><br/>
                    <span className="text-blue-400">const</span> session = <span className="text-primary">Interview.start</span>(&#123; type: <span className="text-green-400">"technical"</span> &#125;);
                  </code>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400"><Search className="w-5 h-5" /></div>
                    <span className="text-sm font-bold">Auto-Discovery</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><Globe className="w-5 h-5" /></div>
                    <span className="text-sm font-bold">Edge Sync</span>
                  </div>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10" />
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </section>
  );
}
