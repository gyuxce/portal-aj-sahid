"use client";

import { useActionState, useEffect, useState } from "react";

import { updateMaterial, type ActionState } from "@/lib/actions/materials";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { MaterialWithCourse } from "@/lib/data/materials";

export function EditMaterialForm({
  material,
}: {
  material: MaterialWithCourse;
}) {
  const [open, setOpen] = useState(false);
  const action = updateMaterial.bind(null, material.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  // Tutup panel setelah berhasil simpan — sama seperti EditTaskForm, biar
  // input uncontrolled (defaultValue) nggak nerima nilai baru sementara
  // masih ke-mount pas revalidatePath refresh data-nya. Disesuaikan saat
  // render (bukan di useEffect) mengikuti pola React untuk derived state.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) {
      setOpen(false);
    }
  }

  // Notifikasi toast — dipisah ke effect (bukan ikut blok di atas) karena
  // ini side effect ke sistem luar (toast manager), bukan setState React.
  useEffect(() => {
    if (state?.success) {
      toast.add({ title: "Perubahan materi disimpan.", type: "success" });
    } else if (state?.error) {
      toast.add({ title: state.error, type: "error" });
    }
  }, [state]);

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
      className="mt-3 grid w-full gap-3 rounded-2xl bg-muted/50 p-3 sm:grid-cols-3"
    >
      {state?.error ? (
        <Alert variant="destructive" className="sm:col-span-3">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor={`title-${material.id}`} className="text-xs">
          Judul
        </Label>
        <Input
          id={`title-${material.id}`}
          name="title"
          defaultValue={material.title}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`meeting-${material.id}`} className="text-xs">
          Pertemuan ke-
        </Label>
        <Input
          id={`meeting-${material.id}`}
          name="meeting_number"
          type="number"
          min={1}
          max={30}
          defaultValue={material.meeting_number ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-3">
        <Label htmlFor={`type-${material.id}`} className="text-xs">
          Tipe materi
        </Label>
        <select
          id={`type-${material.id}`}
          name="material_type"
          defaultValue={material.material_type}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="pdf">PDF</option>
          <option value="ppt">PPT</option>
          <option value="doc">DOC</option>
          <option value="xls">XLS</option>
          <option value="zip">ZIP</option>
          <option value="photo">Foto</option>
          <option value="link">Link</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      <div className="flex gap-2 sm:col-span-3">
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
