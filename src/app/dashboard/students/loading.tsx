import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDirectoryLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-96 w-full rounded-3xl" />
    </div>
  );
}
