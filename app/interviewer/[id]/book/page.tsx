import { Metadata } from 'next';
import { Navbar } from '@/components/common/navbar';
import AuthWrapper from '@/components/auth/auth-wrapper';
import { BookingFlow } from '@/components/interviewer/booking-flow';
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'Book an Interview | Interview with AI',
  description: 'Schedule your human-to-human interview practice session.',
};

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/interviewer/browse">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
                Back to Interviewers
              </Button>
            </Link>
          </div>

          <div className="mb-10 space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Schedule Your Interview</h1>
            <p className="text-muted-foreground text-lg">Pick a date and time that suits your schedule.</p>
          </div>

          <BookingFlow interviewerId={id} />
        </main>
      </div>
    </AuthWrapper>
  );
}
