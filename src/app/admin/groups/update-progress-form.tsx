"use client";

import { useActionState } from "react";

import { updateGroupProgress, type ActionState } from "@/lib/actions/groups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UpdateProgressForm({
  groupId,
  taskId,
  taskTitle,
  currentStatus,
  currentNotes,
}: {
  groupId: string;
  taskId: string;
  taskTitle: string;
  currentStatus?: string;
  currentNotes?: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateGroupProgress,
    null,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3"
    >
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="task_id" value={taskId} />

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <p className="text-sm font-medium">{taskTitle}</p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          name="progress_status"
          defaultValue={currentStatus ?? "not_started"}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="not_started">Belum mulai</option>
          <option value="in_progress">Sedang berjalan</option>
          <option value="done">Selesai</option>
        </select>
        <Input
          name="notes"
          placeholder="Catatan (opsional)"
          defaultValue={currentNotes ?? ""}
          className="h-8 flex-1 min-w-40"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
