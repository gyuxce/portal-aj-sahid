import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatProgressStatus } from "@/lib/format";
import type { GroupProgressStatus } from "@/lib/types/database";

const STATUS_CLASS: Record<GroupProgressStatus, string> = {
  not_started: "",
  in_progress:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  done: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
};

export function ProgressBadge({
  status,
}: {
  status: GroupProgressStatus;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full font-normal", STATUS_CLASS[status])}
    >
      {formatProgressStatus(status)}
    </Badge>
  );
}
