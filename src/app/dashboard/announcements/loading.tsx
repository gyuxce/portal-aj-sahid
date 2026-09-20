import { Skeleton } from "@/components/ui/skeleton";

export default function StudentAnnouncementsLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-3xl" />
      ))}
    </div>
  );
}
