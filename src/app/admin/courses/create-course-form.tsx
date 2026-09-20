"use client";

import { useActionState } from "react";

import { createCourse, type ActionState } from "@/lib/actions/courses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCourse,
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
        <Label htmlFor="code">Kode mata kuliah</Label>
        <Input id="code" name="code" placeholder="MK-101" required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama mata kuliah</Label>
        <Input id="name" name="name" placeholder="Pemrograman Web" required />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="lecturer">Dosen (opsional)</Label>
        <Input id="lecturer" name="lecturer" placeholder="Nama dosen" />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Tambah mata kuliah"}
        </Button>
      </div>
    </form>
  );
}
