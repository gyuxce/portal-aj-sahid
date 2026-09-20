"use client";

import { useState, type FormEvent } from "react";

import { createMaterial } from "@/lib/actions/materials";
import {
  ALLOWED_MATERIAL_MIME_TYPES,
  MAX_MATERIAL_FILE_SIZE,
  detectMaterialTypeFromFileName,
} from "@/lib/validations/materials";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "link" | "file";

export function CreateMaterialForm({
  courseId,
}: {
  courseId: string;
}) {
  const [mode, setMode] = useState<Mode>("file");
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

    if (mode === "file") {
      const files = fd.getAll("file").filter(
        (item): item is File => item instanceof File && item.size > 0,
      );

      if (files.length === 0) {
        setError("Pilih minimal satu file dulu.");
        return;
      }

      for (const file of files) {
        if (file.size > MAX_MATERIAL_FILE_SIZE) {
          setError(`"${file.name}" lebih dari 50MB.`);
          return;
        }
        if (
          ALLOWED_MATERIAL_MIME_TYPES.length > 0 &&
          file.type &&
          !ALLOWED_MATERIAL_MIME_TYPES.includes(file.type)
        ) {
          setError(
            `"${file.name}" tipenya tidak didukung. Gunakan PDF, Word, PPT, Excel, atau ZIP.`,
          );
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
        materialFd.set("material_type", detectMaterialTypeFromFileName(file.name));
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
        setError(
          `${successCount} materi tersimpan, ${failures.length} gagal: ${failures.join(", ")}.`,
        );
      }
      if (successCount > 0) {
        setSuccessMessage(
          successCount === 1
            ? "Materi berhasil ditambahkan."
            : `${successCount} materi berhasil ditambahkan.`,
        );
      }
      if (failures.length === 0) {
        form.reset();
      }
      return;
    }

    // Link mode: single external link.
    fd.delete("file");

    setPending(true);
    const result = await createMaterial(null, fd);
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setSuccessMessage("Materi berhasil ditambahkan.");
    form.reset();
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => {
        // Clear a leftover alert from the previous submit as soon as the
        // admin touches the form again (e.g. picks a new file) — otherwise
        // an old "Materi berhasil ditambahkan." message stays on screen and
        // looks like the newly picked file was already saved.
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
        <Label htmlFor="meeting_number">Pertemuan ke- (opsional)</Label>
        <Input
          id="meeting_number"
          name="meeting_number"
          type="number"
          min={1}
          max={30}
          placeholder="1"
        />
      </div>

      {mode === "link" ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="material_type">Tipe materi</Label>
          <select
            id="material_type"
            name="material_type"
            required
            defaultValue="link"
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="link">Link</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
      ) : (
        <div className="hidden sm:block" />
      )}

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="title">
          {mode === "file"
            ? "Judul materi (opsional, khusus jika hanya 1 file)"
            : "Judul materi"}
        </Label>
        <Input
          id="title"
          name="title"
          placeholder={
            mode === "file"
              ? "Kosongkan untuk pakai nama file"
              : "Slide Pertemuan 1"
          }
          required={mode === "link"}
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            mode === "file"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
            mode === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          Link eksternal
        </button>
      </div>

      {mode === "link" ? (
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="external_url">Link (Google Drive, YouTube, dll)</Label>
          <Input
            id="external_url"
            name="external_url"
            type="url"
            placeholder="https://drive.google.com/..."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="file">File (bisa pilih lebih dari satu, maks. 50MB/file)</Label>
          <input
            id="file"
            name="file"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium"
          />
          <p className="text-xs text-muted-foreground">
            Pilih beberapa file sekaligus (misal materi + file kelompok) — tiap file jadi materi terpisah.
          </p>
        </div>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {uploadProgress ?? (pending ? "Menyimpan..." : "Tambah materi")}
        </Button>
      </div>
    </form>
  );
}
