import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverviewLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Skeleton className="h-32 w-full rounded-3xl" />

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-3xl" />
        ))}
      </div>

      <Skeleton className="h-20 w-full rounded-3xl" />
    </div>
  );
}
