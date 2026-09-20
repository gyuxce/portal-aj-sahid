"use client";

import { useActionState } from "react";

import {
  createAnnouncement,
  type ActionState,
} from "@/lib/actions/announcements";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAnnouncementForm({
  courses,
}: {
  courses: { id: string; name: string; code: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createAnnouncement,
    null,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="course_id">Cakupan</Label>
        <select
          id="course_id"
          name="course_id"
          defaultValue=""
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
          id="is_pinned"
          name="is_pinned"
          type="checkbox"
          className="size-4 rounded border-input"
        />
        <Label htmlFor="is_pinned" className="font-normal">
          Sematkan di atas
        </Label>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="title">Judul</Label>
        <Input id="title" name="title" placeholder="Judul pengumuman" required />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="body">Isi pengumuman</Label>
        <textarea
          id="body"
          name="body"
          rows={4}
          required
          placeholder="Tulis isi pengumuman di sini..."
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Buat pengumuman"}
        </Button>
      </div>
    </form>
  );
}
