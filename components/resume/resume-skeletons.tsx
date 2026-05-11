import { Skeleton } from "@/components/ui/skeleton";

export function ResumeAnalyzerSkeleton() {
  return (
    <div className="w-full">
      {/* Hero Skeleton */}
      <div className="bg-canvas border-b border-hairline py-20 lg:py-32">
        <div className="mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 rounded-pill" />
              <Skeleton className="h-12 w-40 rounded-pill" />
            </div>
          </div>
          <Skeleton className="flex-1 h-[400px] w-full rounded-[32px]" />
        </div>
      </div>

      {/* Selection Skeleton */}
      <div className="bg-canvas-parchment py-24">
        <div className="mx-auto px-6 lg:px-12">
          <Skeleton className="h-10 w-64 mb-16" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[240px] rounded-[24px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalysisResultSkeleton() {
  return (
    <div className="bg-canvas min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* LEFT COLUMN: Sidebar Skeleton (4/12) */}
        <aside className="lg:col-span-4 border-r border-hairline bg-canvas flex flex-col">
          {/* ATS Score Tile */}
          <section className="p-10 lg:p-14 border-b border-hairline bg-canvas space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-5 w-28 rounded-pill" />
              <div className="flex items-baseline gap-3">
                <Skeleton className="h-20 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded-pill" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-14 w-full rounded-pill mt-6" />
          </section>

          {/* Structural Integrity Skeleton */}
          <section className="p-10 lg:p-12 border-b border-hairline bg-canvas-parchment space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-canvas border border-hairline rounded-[18px]">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </section>

          {/* Keywords Skeleton */}
          <section className="p-10 lg:p-12 flex-grow space-y-10">
            <div className="space-y-5">
              <Skeleton className="h-4 w-28" />
              <div className="flex flex-wrap gap-2">
                {Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-pill" />
                ))}
              </div>
            </div>
          </section>
        </aside>

        {/* RIGHT COLUMN: Main Content Skeleton (8/12) */}
        <main className="lg:col-span-8 bg-canvas-parchment overflow-y-auto">
          {/* Strategic Roadmap Skeleton */}
          <section className="p-10 lg:p-20 space-y-16">
            <div className="space-y-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-[500px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex items-start gap-6 p-8 rounded-[24px] bg-canvas border border-hairline shadow-sm">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Gaps Skeleton */}
          <section className="p-10 lg:px-20 lg:pb-32 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Strengths Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-8 bg-canvas border border-hairline rounded-[24px] shadow-sm">
                    <Skeleton className="h-5 w-full mb-3" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-8 bg-canvas border border-hairline rounded-[24px] shadow-sm">
                    <Skeleton className="h-5 w-full mb-3" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export function BuilderSkeleton() {
  return (
    <div className="w-full">
      {/* Hero Skeleton */}
      <div className="bg-canvas border-b border-hairline py-20 lg:py-32">
        <div className="mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="flex-1 h-[400px] w-full rounded-[32px]" />
        </div>
      </div>

      {/* Chat Skeleton */}
      <div className="bg-canvas-parchment min-h-[600px] py-12">
        <div className="mx-auto px-6 lg:px-12 max-w-5xl space-y-12">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className={`flex gap-4 max-w-[80%] ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <Skeleton className={`h-24 w-80 rounded-[24px] ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`} />
              </div>
            </div>
          ))}
          
          <div className="pt-12">
            <Skeleton className="h-16 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function JdMatcherSkeleton() {
  return (
    <div className="w-full">
      {/* Hero Skeleton */}
      <div className="bg-canvas border-b border-hairline py-20 lg:py-32">
        <div className="mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="flex-1 h-[400px] w-full rounded-[32px]" />
        </div>
      </div>

      {/* Selection Skeleton */}
      <div className="bg-canvas-parchment py-24">
        <div className="mx-auto px-6 lg:px-12">
          <Skeleton className="h-10 w-64 mb-16" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[240px] rounded-[24px]" />
            ))}
          </div>
        </div>
      </div>

      {/* JD Input Skeleton */}
      <div className="bg-canvas py-24 border-t border-hairline">
        <div className="mx-auto px-6 lg:px-12 max-w-4xl space-y-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[300px] w-full rounded-[24px]" />
          <Skeleton className="h-14 w-full rounded-pill" />
        </div>
      </div>
    </div>
  );
}

export function JdMatchResultSkeleton() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Hero Header Skeleton */}
      <div className="bg-canvas border-b border-hairline py-16 lg:py-24">
        <div className="mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-6 w-32 rounded-pill" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 rounded-pill" />
            <Skeleton className="h-12 w-48 rounded-pill" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Score Skeleton */}
        <aside className="lg:col-span-4 border-r border-hairline bg-canvas p-10 lg:p-14 space-y-12">
          <div className="text-center space-y-6">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-32 w-48 mx-auto" />
            <Skeleton className="h-3 w-full rounded-pill" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array(10).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-pill" />
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Content Skeleton */}
        <main className="lg:col-span-8 bg-canvas-parchment p-10 lg:p-20 space-y-12">
          <div className="bg-canvas border border-hairline rounded-[32px] overflow-hidden">
            <div className="p-10 border-b border-hairline space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="p-10 space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-[24px]" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function ResumeLandingSkeleton() {
  return (
    <div className="bg-canvas min-h-screen">
      {/* Editorial Hero Skeleton */}
      <section className="relative min-h-[85vh] flex items-center border-b border-hairline overflow-hidden">
        <div className="mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 py-20">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-10">
            <div className="space-y-6">
              <Skeleton className="h-10 w-48 rounded-pill" />
              <Skeleton className="h-32 w-full max-w-2xl" />
              <Skeleton className="h-20 w-full max-w-xl" />
            </div>
            
            <div className="flex flex-wrap gap-4 pt-10">
              <Skeleton className="h-14 w-48 rounded-pill" />
              <Skeleton className="h-14 w-48 rounded-pill" />
            </div>

            <div className="flex gap-12 pt-10 border-t border-hairline max-w-lg">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full h-[600px]">
            <Skeleton className="absolute inset-0 rounded-[40px]" />
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="bg-canvas-parchment py-32">
        <div className="mx-auto px-6 lg:px-12">
          <div className="mb-20 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-3/4 max-w-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-10 bg-canvas border border-hairline rounded-[32px] space-y-8">
                <Skeleton className="h-16 w-16 rounded-[20px]" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="pt-10 border-t border-hairline">
                  <Skeleton className="h-14 w-full rounded-pill" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

