"use client";

import { useActionState } from "react";

import {
  updateGroupPresentation,
  type ActionState,
} from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toDatetimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

/** Deliberately its own tiny form, separate from EditGroupForm — admins set
 * this per group closer to presentation day, much more often than they
 * add members or change the WA link, so it shouldn't sit behind that form. */
export function PresentationScheduleForm({
  groupId,
  currentPresentationAt,
}: {
  groupId: string;
  currentPresentationAt: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateGroupPresentation,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="group_id" value={groupId} />
      <Input
        aria-label="Jadwal presentasi kelompok"
        name="presentation_at"
        type="datetime-local"
        defaultValue={
          currentPresentationAt
            ? toDatetimeLocalValue(currentPresentationAt)
            : ""
        }
        className="h-8 w-fit"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan"}
      </Button>
      {state?.error ? (
        <p className="w-full text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
