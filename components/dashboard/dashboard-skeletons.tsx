import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsSkeletonProps {
  mode?: "interview" | "resume" | "both";
}

export function StatsSkeleton({ mode = "both" }: StatsSkeletonProps = {}) {
  const isSingleMode = mode === "interview" || mode === "resume";

  const renderInterviewSkeleton = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div
        className={
          isSingleMode
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "grid grid-cols-2 gap-4"
        }
      >
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border-primary/5 bg-parchment/40 dark:bg-ink/10"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-28 mt-2" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderResumeSkeleton = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500/50" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <div
        className={
          isSingleMode
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "grid grid-cols-2 gap-4"
        }
      >
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border-primary/5 bg-parchment/40 dark:bg-ink/10"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-28 mt-2" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  if (isSingleMode) {
    return (
      <div className="mb-8">
        {mode === "interview"
          ? renderInterviewSkeleton()
          : renderResumeSkeleton()}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {renderInterviewSkeleton()}
      {renderResumeSkeleton()}
    </div>
  );
}

export function InterviewsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="p-6 border-primary/5">
              <div className="flex gap-4 items-start">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <Card className="p-6 border-primary/5">
        <CardHeader className="px-0 pt-0">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </Card>
      <Card className="p-6 border-primary/5">
        <CardHeader className="px-0 pt-0">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </Card>
    </div>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>
      <Skeleton className="h-12 w-48 rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto">
      <DashboardHeaderSkeleton />
      <StatsSkeleton />
      <ChartsSkeleton />
      <InterviewsListSkeleton />
    </div>
  );
}

export function DashboardTabContainerSkeleton() {
  return (
    <div className="space-y-10 w-full animate-pulse">
      {/* Sliding tabs toggle skeleton */}
      <div className="flex justify-center">
        <div className="w-full max-w-md h-12 bg-parchment/40 dark:bg-ink/10 border border-hairline rounded-full flex items-center p-1 gap-1">
          <div className="flex-1 h-full bg-white dark:bg-indigo-500/30 rounded-full" />
          <div className="flex-1 h-full bg-transparent" />
        </div>
      </div>
      
      {/* Stats, charts, and list grids skeletons */}
      <div className="space-y-16">
        <StatsSkeleton mode="both" />
        <ChartsSkeleton />
        <InterviewsListSkeleton />
      </div>
    </div>
  );
}

