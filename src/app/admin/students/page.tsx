import { IdCard, UserPlus } from "lucide-react";

import { BulkAddForm } from "@/app/admin/students/bulk-add-form";
import { ResetPasswordForm } from "@/app/admin/students/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StudentSearchList } from "@/components/dashboard/student-search-list";
import { getAllStudents } from "@/lib/data/students";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminStudentsPage() {
  const configured = isSupabaseConfigured();
  const students = configured ? await getAllStudents() : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mahasiswa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akun mahasiswa. Login pakai NIM, semua akun baru berbagi satu
          password yang kamu tentukan.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <UserPlus className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <CardTitle>Tambah mahasiswa (banyak sekaligus)</CardTitle>
            <CardDescription>
              Paste daftar NIM dan nama, satu baris per mahasiswa.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <BulkAddForm />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase (termasuk SUPABASE_SERVICE_ROLE_KEY) untuk
              mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {students.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title="Belum ada mahasiswa"
          description="Tambahkan mahasiswa melalui form di atas."
        />
      ) : (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Daftar mahasiswa ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentSearchList
              students={students.map((s) => ({
                id: s.id,
                full_name: s.full_name,
                nim: s.nim,
              }))}
              actions={
                configured
                  ? Object.fromEntries(
                      students.map((s) => [
                        s.id,
                        <ResetPasswordForm key={s.id} profileId={s.id} />,
                      ]),
                    )
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
