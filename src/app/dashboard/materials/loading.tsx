import { Skeleton } from "@/components/ui/skeleton";

export default function StudentMaterialsLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
