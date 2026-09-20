"use client";

import { useActionState, useState } from "react";

import {
  updateAnnouncement,
  type ActionState,
} from "@/lib/actions/announcements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnnouncementWithCourse } from "@/lib/data/announcements";

export function EditAnnouncementForm({
  announcement,
  courses,
}: {
  announcement: AnnouncementWithCourse;
  courses: { id: string; name: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const action = updateAnnouncement.bind(null, announcement.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
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
        <Label htmlFor={`course-${announcement.id}`} className="text-xs">
          Cakupan
        </Label>
        <select
          id={`course-${announcement.id}`}
          name="course_id"
          defaultValue={announcement.course_id ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="">Pengumuman umum (semua mata kuliah)</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} · {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 self-end pb-2">
        <input
          id={`pinned-${announcement.id}`}
          name="is_pinned"
          type="checkbox"
          defaultChecked={announcement.is_pinned}
          className="size-4 rounded border-input"
        />
        <Label htmlFor={`pinned-${announcement.id}`} className="font-normal">
          Sematkan di atas
        </Label>
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`title-${announcement.id}`} className="text-xs">
          Judul
        </Label>
        <Input
          id={`title-${announcement.id}`}
          name="title"
          defaultValue={announcement.title}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`body-${announcement.id}`} className="text-xs">
          Isi pengumuman
        </Label>
        <textarea
          id={`body-${announcement.id}`}
          name="body"
          rows={4}
          required
          defaultValue={announcement.body}
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
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
