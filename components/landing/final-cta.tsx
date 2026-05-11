import { FadeInWhenVisible } from "./animated-sections";

export function FinalCTA() {
  return (
    <section className="py-40 px-6 text-center relative">
      <div className="max-w-4xl mx-auto space-y-10">
        <FadeInWhenVisible direction="up">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
            Step Into the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Infinite.</span>
          </h2>
          {/* <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Join 5,000+ candidates building their future on InterviewAI. Start your free trial today.
          </p> */}
        </FadeInWhenVisible>
        
        <FadeInWhenVisible delay={0.2} direction="up">
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="h-16 text-white px-12 rounded-full bg-primary text-primary-foreground font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20">
              Create Free Account
            </button>
            {/* <button className="h-16 px-12 rounded-full border border-border bg-card text-foreground font-bold text-xl hover:scale-105 active:scale-95 transition-all hover:bg-muted">
              Talk to Sales
            </button> */}
          </div>
        </FadeInWhenVisible>
      </div>
      
      {/* Absolute Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-primary/5 blur-[160px] -z-10 rounded-full" />
    </section>
  );
}
