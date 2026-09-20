"use client";

import { useActionState } from "react";

import { addSchedule, type ActionState } from "@/lib/actions/courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddScheduleForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addSchedule,
    null,
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-4">
      <input type="hidden" name="course_id" value={courseId} />

      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-4">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`day-${courseId}`} className="text-xs">
          Hari
        </Label>
        <select
          id={`day-${courseId}`}
          name="day_of_week"
          required
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="friday">Jumat</option>
          <option value="saturday">Sabtu</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`start-${courseId}`} className="text-xs">
          Mulai
        </Label>
        <Input
          id={`start-${courseId}`}
          name="start_time"
          type="time"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`end-${courseId}`} className="text-xs">
          Selesai
        </Label>
        <Input id={`end-${courseId}`} name="end_time" type="time" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`note-${courseId}`} className="text-xs">
          Catatan
        </Label>
        <Input
          id={`note-${courseId}`}
          name="note"
          placeholder="Ruang/Zoom"
        />
      </div>

      <div className="sm:col-span-4">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Menyimpan..." : "Tambah jadwal"}
        </Button>
      </div>
    </form>
  );
}
