"use client";

import { useState, type FormEvent } from "react";

import { updateAnnouncement } from "@/lib/actions/announcements";
import {
  ALLOWED_ANNOUNCEMENT_IMAGE_MIME_TYPES,
  MAX_ANNOUNCEMENT_IMAGE_SIZE,
} from "@/lib/validations/announcements";
import { createClient } from "@/lib/supabase/client";
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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const fd = new FormData(form);

    const file = fd.get("image");
    fd.delete("image");

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_ANNOUNCEMENT_IMAGE_SIZE) {
        setError("Ukuran gambar maksimal 5MB.");
        return;
      }
      if (!ALLOWED_ANNOUNCEMENT_IMAGE_MIME_TYPES.includes(file.type)) {
        setError("Tipe gambar harus PNG, JPG, atau WebP.");
        return;
      }

      setUploading(true);
      const extension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
      const path = `${crypto.randomUUID()}${extension}`;

      const supabase = createClient();
      const { error: uploadErr } = await supabase.storage
        .from("announcement-images")
        .upload(path, file);
      setUploading(false);

      if (uploadErr) {
        setError(`Gagal upload gambar: ${uploadErr.message}`);
        return;
      }

      fd.set("image_path", path);
    }

    setPending(true);
    const result = await updateAnnouncement(announcement.id, null, fd);
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  const busy = pending || uploading;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 grid gap-3 rounded-2xl bg-muted/50 p-3 sm:grid-cols-2"
    >
      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
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

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`image-${announcement.id}`} className="text-xs">
          Gambar / banner (opsional)
        </Label>
        {announcement.imageUrl ? (
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL */}
            <img
              src={announcement.imageUrl}
              alt=""
              className={
                removeImage
                  ? "h-14 w-24 rounded-lg object-cover opacity-30"
                  : "h-14 w-24 rounded-lg object-cover"
              }
            />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                name="remove_image"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
                className="size-3.5 rounded border-input"
              />
              Hapus gambar ini
            </label>
          </div>
        ) : null}
        <input
          id={`image-${announcement.id}`}
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-2.5 file:py-1 file:text-xs file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          Kosongkan untuk pakai gambar yang sudah ada. Upload baru otomatis mengganti.
        </p>
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {uploading ? "Mengunggah..." : pending ? "Menyimpan..." : "Simpan perubahan"}
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
