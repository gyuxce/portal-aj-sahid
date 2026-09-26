"use client";

import { useState, type FormEvent } from "react";

import { createMaterial } from "@/lib/actions/materials";
import {
  ALLOWED_MATERIAL_IMAGE_MIME_TYPES,
  MAX_MATERIAL_FILE_SIZE,
} from "@/lib/validations/materials";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export function CreatePhotoForm({ courseId }: { courseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const form = event.currentTarget;
    const fd = new FormData(form);

    const meetingNumber = fd.get("meeting_number");
    const sharedTitle = String(fd.get("title") ?? "").trim();

    const files = fd.getAll("file").filter(
      (item): item is File => item instanceof File && item.size > 0,
    );

    if (files.length === 0) {
      setError("Pilih minimal satu foto dulu.");
      return;
    }

    for (const file of files) {
      if (file.size > MAX_MATERIAL_FILE_SIZE) {
        setError(`"${file.name}" lebih dari 50MB.`);
        return;
      }
      if (file.type && !ALLOWED_MATERIAL_IMAGE_MIME_TYPES.includes(file.type)) {
        setError(`"${file.name}" bukan foto (JPG/PNG/WebP/HEIC).`);
        return;
      }
    }

    setPending(true);
    const supabase = createClient();
    const failures: string[] = [];
    let successCount = 0;

    for (const file of files) {
      setUploadProgress(`Mengunggah ${file.name}...`);

      const extension = file.name.includes(".")
        ? file.name.slice(file.name.lastIndexOf("."))
        : "";
      const path = `${courseId}/materials/${crypto.randomUUID()}${extension}`;

      const { error: uploadErr } = await supabase.storage
        .from("class-materials")
        .upload(path, file);

      if (uploadErr) {
        failures.push(`${file.name} (gagal upload)`);
        continue;
      }

      const nameWithoutExtension = file.name.includes(".")
        ? file.name.slice(0, file.name.lastIndexOf("."))
        : file.name;

      const materialFd = new FormData();
      materialFd.set("course_id", courseId);
      if (meetingNumber) materialFd.set("meeting_number", String(meetingNumber));
      materialFd.set(
        "title",
        files.length === 1 && sharedTitle ? sharedTitle : nameWithoutExtension,
      );
      materialFd.set("material_type", "photo");
      materialFd.set("storage_path", path);
      materialFd.set("file_name", file.name);
      materialFd.set("file_size", String(file.size));

      const result = await createMaterial(null, materialFd);
      if (result?.error) {
        failures.push(`${file.name} (${result.error})`);
        await supabase.storage.from("class-materials").remove([path]);
        continue;
      }

      successCount += 1;
    }

    setUploadProgress(null);
    setPending(false);

    if (failures.length > 0) {
      const message = `${successCount} foto tersimpan, ${failures.length} gagal: ${failures.join(", ")}.`;
      setError(message);
      toast.add({ title: message, type: "error" });
    }
    if (successCount > 0) {
      const message =
        successCount === 1
          ? "Foto berhasil ditambahkan."
          : `${successCount} foto berhasil ditambahkan.`;
      setSuccessMessage(message);
      toast.add({ title: message, type: "success" });
    }
    if (failures.length === 0) {
      form.reset();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        if (error || successMessage) {
          setError(null);
          setSuccessMessage(null);
        }
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {successMessage ? (
        <Alert className="sm:col-span-2">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="course_id" value={courseId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="photo_meeting_number">Pertemuan ke- (opsional)</Label>
        <Input
          id="photo_meeting_number"
          name="meeting_number"
          type="number"
          min={1}
          max={30}
          placeholder="1"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="photo_title">
          Judul (opsional, khusus jika hanya 1 foto)
        </Label>
        <Input
          id="photo_title"
          name="title"
          placeholder="Kosongkan untuk pakai nama file"
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="photo_file">
          Foto (bisa pilih lebih dari satu, maks. 50MB/file)
        </Label>
        <input
          id="photo_file"
          name="file"
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.heic"
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          Misal screenshot bukti hadir Zoom — tiap foto jadi materi terpisah bertipe &quot;Foto&quot;.
        </p>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {uploadProgress ?? (pending ? "Menyimpan..." : "Simpan")}
        </Button>
      </div>
    </form>
  );
}
