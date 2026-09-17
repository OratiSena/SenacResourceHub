import { Skeleton } from "@/components/ui/skeleton";

export default function ResourceDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-40" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-11 w-48 rounded-lg" />
        </div>
      </div>

      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
