"use client";

import { useActionState, useEffect } from "react";

import { updateCourse, type ActionState } from "@/lib/actions/courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CourseWithSchedule } from "@/lib/data/courses";

export function EditCourseForm({
  course,
  onDone,
}: {
  course: CourseWithSchedule;
  onDone: () => void;
}) {
  const action = updateCourse.bind(null, course.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-2xl bg-muted/50 p-3 sm:grid-cols-2"
    >
      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`code-${course.id}`} className="text-xs">
          Kode
        </Label>
        <Input
          id={`code-${course.id}`}
          name="code"
          defaultValue={course.code}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`name-${course.id}`} className="text-xs">
          Nama mata kuliah
        </Label>
        <Input
          id={`name-${course.id}`}
          name="name"
          defaultValue={course.name}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`lecturer-${course.id}`} className="text-xs">
          Dosen
        </Label>
        <Input
          id={`lecturer-${course.id}`}
          name="lecturer"
          defaultValue={course.lecturer ?? ""}
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan perubahan"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Batal
        </Button>
      </div>
    </form>
  );
}
