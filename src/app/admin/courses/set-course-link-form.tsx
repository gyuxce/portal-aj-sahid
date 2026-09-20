"use client";

import { useActionState } from "react";

import { setActiveCourseLink, type ActionState } from "@/lib/actions/courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SetCourseLinkForm({ courseId }: { courseId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setActiveCourseLink,
    null,
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-3">
      <input type="hidden" name="course_id" value={courseId} />

      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-3">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state?.success ? (
        <Alert className="sm:col-span-3">
          <AlertDescription>
            Link aktif diperbarui. Link lama otomatis diarsipkan.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`url-${courseId}`} className="text-xs">
          URL link kelas baru
        </Label>
        <Input
          id={`url-${courseId}`}
          name="url"
          type="url"
          placeholder="https://zoom.us/..."
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`label-${courseId}`} className="text-xs">
          Label (opsional)
        </Label>
        <Input
          id={`label-${courseId}`}
          name="label"
          placeholder="Zoom Jumat malam"
        />
      </div>

      <div className="sm:col-span-3">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Menyimpan..." : "Ganti link aktif"}
        </Button>
      </div>
    </form>
  );
}
