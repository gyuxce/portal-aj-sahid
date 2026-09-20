"use client";

import { useRef, useState, type FormEvent } from "react";

import { createTask } from "@/lib/actions/tasks";
import { createMaterial } from "@/lib/actions/materials";
import {
  ALLOWED_MATERIAL_MIME_TYPES,
  MAX_MATERIAL_FILE_SIZE,
} from "@/lib/validations/materials";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MaterialMode = "link" | "file";

export function CreateTaskForm({
  courses,
  fixedCourseId,
}: {
  /** Full course list for the standalone dropdown — omit when fixedCourseId
   * is set, since the form is already scoped to one course's page. */
  courses?: { id: string; name: string; code: string }[];
  fixedCourseId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [includeMaterial, setIncludeMaterial] = useState(false);
  const [materialMode, setMaterialMode] = useState<MaterialMode>("link");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const fd = new FormData(event.currentTarget);
    const courseId = String(fd.get("course_id") ?? "");

    // Pull the material-only fields out before sending the rest to createTask.
    const materialTitle = String(fd.get("material_title") ?? "").trim();
    const materialType = String(fd.get("material_type") ?? "pdf");
    const materialUrl = String(fd.get("material_external_url") ?? "").trim();
    const materialFile = fd.get("material_file");
    fd.delete("material_title");
    fd.delete("material_type");
    fd.delete("material_external_url");
    fd.delete("material_file");

    setPending(true);

    const taskResult = await createTask(null, fd);
    if (taskResult?.error || !taskResult?.taskId) {
      setPending(false);
      setError(taskResult?.error ?? "Gagal menyimpan tugas.");
      return;
    }

    if (includeMaterial && materialTitle) {
      const materialFd = new FormData();
      materialFd.set("course_id", courseId);
      materialFd.set("task_id", taskResult.taskId);
      materialFd.set("title", materialTitle);
      materialFd.set("material_type", materialType);

      if (materialMode === "file" && materialFile instanceof File && materialFile.size > 0) {
        if (materialFile.size > MAX_MATERIAL_FILE_SIZE) {
          setPending(false);
          setError(
            "Tugas tersimpan, tapi file materi terlalu besar (maks 50MB) — tambahkan manual lewat menu Materi.",
          );
          return;
        }
        if (
          materialFile.type &&
          !ALLOWED_MATERIAL_MIME_TYPES.includes(materialFile.type)
        ) {
          setPending(false);
          setError(
            "Tugas tersimpan, tapi tipe file materi tidak didukung — tambahkan manual lewat menu Materi.",
          );
          return;
        }

        const extension = materialFile.name.includes(".")
          ? materialFile.name.slice(materialFile.name.lastIndexOf("."))
          : "";
        const path = `${courseId}/materials/${crypto.randomUUID()}${extension}`;
        const supabase = createClient();
        const { error: uploadErr } = await supabase.storage
          .from("class-materials")
          .upload(path, materialFile);

        if (uploadErr) {
          setPending(false);
          setError(
            `Tugas tersimpan, tapi upload materi gagal: ${uploadErr.message}`,
          );
          return;
        }

        materialFd.set("storage_path", path);
        materialFd.set("file_name", materialFile.name);
        materialFd.set("file_size", String(materialFile.size));
      } else if (materialMode === "link" && materialUrl) {
        materialFd.set("external_url", materialUrl);
      }

      const materialResult = await createMaterial(null, materialFd);
      if (materialResult?.error) {
        setPending(false);
        setError(`Tugas tersimpan, tapi materi gagal: ${materialResult.error}`);
        return;
      }
    }

    setPending(false);
    setSuccess(true);
    setIncludeMaterial(false);
    formRef.current?.reset();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-4 sm:grid-cols-2"
    >
      {error ? (
        <Alert variant="destructive" className="sm:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert className="sm:col-span-2">
          <AlertDescription>Tugas berhasil ditambahkan.</AlertDescription>
        </Alert>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-2",
          fixedCourseId ? "sm:col-span-2" : undefined,
        )}
      >
        <Label htmlFor="task_code">Kode tugas</Label>
        <Input id="task_code" name="task_code" placeholder="TASK-001" required />
      </div>

      {fixedCourseId ? (
        <input type="hidden" name="course_id" value={fixedCourseId} />
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="course_id">Mata kuliah</Label>
          <select
            id="course_id"
            name="course_id"
            required
            defaultValue=""
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
          >
            <option value="" disabled>
              Pilih mata kuliah
            </option>
            {(courses ?? []).map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="title">Judul tugas</Label>
        <Input id="title" name="title" placeholder="Tugas Individu 1" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="task_type">Jenis tugas</Label>
        <select
          id="task_type"
          name="task_type"
          required
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="individual">Individu</option>
          <option value="group">Kelompok</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" name="deadline" type="datetime-local" required />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <Input id="description" name="description" placeholder="Detail tugas" />
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          id="include_material"
          type="checkbox"
          checked={includeMaterial}
          onChange={(e) => setIncludeMaterial(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="include_material" className="font-normal">
          Sertakan materi pendukung (opsional)
        </Label>
      </div>

      {includeMaterial ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-3 sm:col-span-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMaterialMode("link")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                materialMode === "link"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              Link eksternal
            </button>
            <button
              type="button"
              onClick={() => setMaterialMode("file")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                materialMode === "file"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              Upload file
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material_title" className="text-xs">
                Judul materi
              </Label>
              <Input
                id="material_title"
                name="material_title"
                placeholder="Template ERD"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material_type" className="text-xs">
                Tipe materi
              </Label>
              <select
                id="material_type"
                name="material_type"
                defaultValue="pdf"
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="ppt">PPT</option>
                <option value="doc">DOC</option>
                <option value="xls">XLS</option>
                <option value="zip">ZIP</option>
                <option value="link">Link</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
          </div>

          {materialMode === "link" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material_external_url" className="text-xs">
                Link (Google Drive, dll)
              </Label>
              <Input
                id="material_external_url"
                name="material_external_url"
                type="url"
                placeholder="https://drive.google.com/..."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material_file" className="text-xs">
                File (maks. 50MB)
              </Label>
              <input
                id="material_file"
                name="material_file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-background file:px-2.5 file:py-1 file:text-xs file:font-medium"
              />
            </div>
          )}
        </div>
      ) : null}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Tambah tugas"}
        </Button>
      </div>
    </form>
  );
}
