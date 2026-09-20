import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCourseMaterialsLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
  );
}
