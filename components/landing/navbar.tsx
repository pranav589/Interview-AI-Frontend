import Link from "next/link";

export function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-6">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="InterviewAI Logo" className="w-12 h-12 object-contain" />
        <span className="text-2xl font-bold tracking-tight">InterviewAI</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="#overview" className="hover:text-foreground transition-colors">Overview</Link>
        <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
        <Link href="#solutions" className="hover:text-foreground transition-colors">Solutions</Link>
        <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/auth/signin">
          <button className="hidden sm:block px-4 py-2 text-sm font-medium hover:text-primary transition-colors">Login</button>
        </Link>
        <Link href="/auth/signup">
          <button className="px-5 py-2 bg-foreground text-background rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all">Start Free</button>
        </Link>
      </div>
    </nav>
  );
}
