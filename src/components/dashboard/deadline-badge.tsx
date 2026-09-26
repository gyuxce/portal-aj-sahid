import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDeadlineStatusLabel, getDeadlineStatus } from "@/lib/format";

const STATUS_CLASS: Record<string, string> = {
  overdue: "",
  today: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
  soon: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400",
  upcoming: "",
};

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  if (!deadline) {
    return null;
  }

  const status = getDeadlineStatus(deadline);

  return (
    <Badge
      variant={status === "overdue" ? "destructive" : "secondary"}
      className={cn("rounded-full font-normal", STATUS_CLASS[status])}
    >
      {formatDeadlineStatusLabel(status)}
    </Badge>
  );
}
