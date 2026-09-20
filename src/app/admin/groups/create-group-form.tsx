"use client";

import { useActionState, useState } from "react";

import { createGroup, type ActionState } from "@/lib/actions/groups";
import { StudentPicker } from "@/app/admin/groups/student-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateGroupForm({
  courseId,
  students,
  takenIds,
}: {
  courseId: string;
  students: { id: string; full_name: string }[];
  takenIds: string[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createGroup,
    null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [seenState, setSeenState] = useState(state);

  // Clearing the checkboxes once the save lands, so the next group does not
  // start with the previous one's members still ticked. React resets the
  // uncontrolled fields itself; only this controlled set needs handling.
  if (state !== seenState) {
    setSeenState(state);
    if (state?.success) {
      setSelected(new Set());
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="course_id" value={courseId} />
      {/* One joined field instead of many same-name checkboxes — more
       * predictable than relying on formData.getAll() picking up every
       * checked box, and avoids that failure mode entirely. */}
      <input type="hidden" name="profile_ids" value={[...selected].join(",")} />

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state?.success ? (
        <Alert>
          <AlertDescription>Kelompok tersimpan.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama kelompok</Label>
        <Input id="name" name="name" placeholder="Kelompok 1" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Anggota</Label>
        <StudentPicker
          students={students}
          takenIds={new Set(takenIds)}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="wa_group_link">Link grup WhatsApp (opsional)</Label>
        <Input
          id="wa_group_link"
          name="wa_group_link"
          type="url"
          placeholder="https://chat.whatsapp.com/..."
        />
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Menyimpan..." : "Simpan kelompok"}
      </Button>
    </form>
  );
}
