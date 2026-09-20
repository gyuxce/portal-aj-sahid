"use client";

import { useActionState, useState } from "react";

import { updateTask, type ActionState } from "@/lib/actions/tasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaskWithCourse } from "@/lib/data/tasks";

function toDateValue(deadline: string) {
  const date = new Date(deadline);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function EditTaskForm({
  task,
  courses,
}: {
  task: TaskWithCourse;
  courses: { id: string; name: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const action = updateTask.bind(null, task.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="h-7" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-3 grid gap-3 rounded-2xl bg-muted/50 p-3 sm:grid-cols-2"
    >
      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`course-${task.id}`} className="text-xs">
          Mata kuliah
        </Label>
        <select
          id={`course-${task.id}`}
          name="course_id"
          defaultValue={task.course_id}
          required
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} · {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`type-${task.id}`} className="text-xs">
          Jenis
        </Label>
        <select
          id={`type-${task.id}`}
          name="task_type"
          defaultValue={task.task_type}
          required
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="individual">Individu</option>
          <option value="group">Kelompok</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`title-${task.id}`} className="text-xs">
          Judul
        </Label>
        <Input
          id={`title-${task.id}`}
          name="title"
          defaultValue={task.title}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`deadline-${task.id}`} className="text-xs">
          Deadline
        </Label>
        <Input
          id={`deadline-${task.id}`}
          name="deadline"
          type="date"
          defaultValue={toDateValue(task.deadline)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`desc-${task.id}`} className="text-xs">
          Deskripsi
        </Label>
        <Input
          id={`desc-${task.id}`}
          name="description"
          defaultValue={task.description ?? ""}
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan perubahan"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
