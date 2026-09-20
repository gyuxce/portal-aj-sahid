"use client";

import { useActionState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import {
  bulkCreateStudents,
  type BulkCreateState,
} from "@/lib/actions/students";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BulkAddForm() {
  const [state, formAction, pending] = useActionState<
    BulkCreateState,
    FormData
  >(bulkCreateStudents, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="raw_list">Daftar mahasiswa</Label>
          <textarea
            id="raw_list"
            name="raw_list"
            rows={6}
            required
            placeholder={"2024010001, Ahmad Fauzi\n2024010002, Siti Amalia\n2024010003, Budi Santoso"}
            className="rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Satu mahasiswa per baris, format: <code>NIM, Nama Lengkap</code>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="shared_password">Password untuk semua akun ini</Label>
          <Input
            id="shared_password"
            name="shared_password"
            placeholder="Minimal 8 karakter"
            required
          />
          <p className="text-xs text-muted-foreground">
            Umumkan password ini ke kelas setelah akun dibuat. Login pakai
            NIM masing-masing sebagai username.
          </p>
        </div>

        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Memproses..." : "Buat akun"}
        </Button>
      </form>

      {state?.rows ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-muted/50 p-3">
          <p className="text-sm font-medium">
            {state.rows.filter((r) => r.status === "ok").length} berhasil,{" "}
            {state.rows.filter((r) => r.status === "error").length} gagal
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {state.rows.map((row, i) => (
              <li key={`${row.nim}-${i}`} className="flex items-center gap-2">
                {row.status === "ok" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="size-4 shrink-0 text-destructive" />
                )}
                <span>
                  {row.nim} — {row.fullName || "(nama kosong)"}
                </span>
                {row.message ? (
                  <span className="text-xs text-muted-foreground">
                    ({row.message})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
