import { Skeleton } from "@/components/ui/skeleton";

export default function StudentCourseMaterialsLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
