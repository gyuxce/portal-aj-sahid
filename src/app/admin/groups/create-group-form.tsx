"use client";

import { useActionState } from "react";

import { createGroup, type ActionState } from "@/lib/actions/groups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CreateGroupForm({
  courses,
  fixedCourseId,
}: {
  /** Full course list for the standalone dropdown — omit when fixedCourseId
   * is set, since the form is already scoped to one course's page. */
  courses?: { id: string; name: string; code: string }[];
  fixedCourseId?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createGroup,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {fixedCourseId ? (
        <input type="hidden" name="course_id" value={fixedCourseId} />
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="course_id">Mata kuliah</Label>
          <select
            id="course_id"
            name="course_id"
            required
            defaultValue=""
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="" disabled>
              Pilih mata kuliah
            </option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-2",
          fixedCourseId ? "sm:col-span-2" : undefined,
        )}
      >
        <Label htmlFor="name">Nama kelompok</Label>
        <Input id="name" name="name" placeholder="Kelompok 1" required />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Input id="notes" name="notes" placeholder="Catatan admin" />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="wa_group_link">Link grup WhatsApp (opsional)</Label>
        <Input
          id="wa_group_link"
          name="wa_group_link"
          type="url"
          placeholder="https://chat.whatsapp.com/..."
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Tambah kelompok"}
        </Button>
      </div>
    </form>
  );
}
