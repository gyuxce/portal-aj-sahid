import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHomeLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Skeleton className="h-36 w-full rounded-3xl" />

      <div>
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>

      <div>
        <Skeleton className="mb-3 h-4 w-40" />
        <div className="flex flex-col gap-2.5">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
