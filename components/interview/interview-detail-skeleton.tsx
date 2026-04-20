import { Skeleton } from "@/components/ui/skeleton";

export function InterviewDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Back button skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <div className="space-y-4 mb-8">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <Skeleton className="w-56 h-56 rounded-full" />
        </div>

        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="p-6 border rounded-xl space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
