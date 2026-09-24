"use client";

import { useState, type FormEvent } from "react";

import { createAnnouncement } from "@/lib/actions/announcements";
import {
  ALLOWED_ANNOUNCEMENT_IMAGE_MIME_TYPES,
  MAX_ANNOUNCEMENT_IMAGE_SIZE,
} from "@/lib/validations/announcements";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAnnouncementForm({
  courses,
}: {
  courses: { id: string; name: string; code: string }[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
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
    const result = await createAnnouncement(null, fd);
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    form.reset();
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert className="sm:col-span-2">
          <AlertDescription>Pengumuman berhasil ditambahkan.</AlertDescription>
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

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="image">Gambar / banner (opsional)</Label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          Kalau diisi, pengumuman ini otomatis ikut tampil di carousel Beranda. Maks 5MB (PNG/JPG/WebP).
        </p>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {uploading ? "Mengunggah gambar..." : pending ? "Menyimpan..." : "Buat pengumuman"}
        </Button>
      </div>
    </form>
  );
}
