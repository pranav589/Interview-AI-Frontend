import { MessageSquare } from "lucide-react";
import { FadeInWhenVisible } from "./animated-sections";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <FadeInWhenVisible direction="none">
          <div className="relative p-12 md:p-20 rounded-[4rem] bg-muted/50 border border-border text-center overflow-hidden">
            <MessageSquare className="w-16 h-16 text-primary/20 mx-auto mb-10" />
            <blockquote className="text-3xl md:text-5xl font-medium mb-12 italic leading-tight tracking-tight text-foreground">
              "The infinite grid wasn't just a design choice, it was a philosophy. InterviewAI helped us visualize our preparation in a way no other platform could."
            </blockquote>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" alt="Founder" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-black text-2xl">Marcus Thorne</div>
                <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs mt-1">Founder @ NovaStack</div>
              </div>
            </div>
            
            {/* Background patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
