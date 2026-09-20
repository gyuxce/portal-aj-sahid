"use client";

import { useActionState, useState } from "react";

import { updateGroup, type ActionState } from "@/lib/actions/groups";
import { StudentPicker } from "@/app/admin/groups/student-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toDatetimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EditGroupForm({
  groupId,
  students,
  takenIds,
  currentLink,
  currentPresentationAt,
}: {
  groupId: string;
  students: { id: string; full_name: string }[];
  takenIds: string[];
  currentLink: string | null;
  currentPresentationAt: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateGroup,
    null,
  );
  // Selection resets on its own: the page re-keys this form by member list,
  // so a successful save remounts it with an empty picker.
  const [selected, setSelected] = useState<Set<string>>(new Set());

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
      <input type="hidden" name="group_id" value={groupId} />

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state?.success ? (
        <Alert>
          <AlertDescription>Perubahan tersimpan.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label>Tambah anggota</Label>
        <StudentPicker
          students={students}
          takenIds={new Set(takenIds)}
          selected={selected}
          onToggle={toggle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`wa-${groupId}`}>Link grup WhatsApp</Label>
        <Input
          id={`wa-${groupId}`}
          name="wa_group_link"
          type="url"
          defaultValue={currentLink ?? ""}
          placeholder="https://chat.whatsapp.com/..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`presentation-${groupId}`}>
          Jadwal presentasi kelompok
        </Label>
        <Input
          id={`presentation-${groupId}`}
          name="presentation_at"
          type="datetime-local"
          defaultValue={
            currentPresentationAt
              ? toDatetimeLocalValue(currentPresentationAt)
              : ""
          }
        />
        <p className="text-xs text-muted-foreground">
          Opsional — beda dari deadline tugas, ini jadwal kelompok ini
          kebagian presentasi.
        </p>
      </div>

      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        className="w-fit"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
