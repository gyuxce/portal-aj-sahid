"use client";

import { useActionState, useEffect } from "react";

import {
  updateGroupPresentation,
  type ActionState,
} from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

function toDateValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
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

  // Notifikasi toast — di effect karena ini side effect ke sistem luar
  // (toast manager), bukan setState React.
  useEffect(() => {
    if (state?.success) {
      toast.add({ title: "Jadwal presentasi disimpan.", type: "success" });
    } else if (state?.error) {
      toast.add({ title: state.error, type: "error" });
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="group_id" value={groupId} />
      <Input
        // Key di-tie ke nilai dari server: begitu berhasil simpan dan
        // revalidatePath ngirim currentPresentationAt baru, React nge-remount
        // input ini (bukan reuse instance lama) — jadi defaultValue-nya
        // nggak "berubah sementara masih ke-mount" (itu yang bikin Base UI
        // protes dan Next dev nampilin overlay error, nutupin toast/loading).
        key={currentPresentationAt ?? "none"}
        aria-label="Jadwal presentasi kelompok"
        name="presentation_at"
        type="date"
        defaultValue={
          currentPresentationAt ? toDateValue(currentPresentationAt) : ""
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
