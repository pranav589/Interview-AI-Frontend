import React from "react";
import Link from "next/link";
import { 
  Globe, 
  Code2, 
  Zap 
} from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 px-8 border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="InterviewAI Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold tracking-tight">InterviewAI</span>
            </div>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Building the foundational grid for the next generation of intelligent interview preparation.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24">
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Product</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Enterprise</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Company</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Press</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Legal</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">© 2026 INTERVIEWAI SYSTEMS INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors"><Globe className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-primary transition-colors"><Code2 className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-primary transition-colors"><Zap className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
