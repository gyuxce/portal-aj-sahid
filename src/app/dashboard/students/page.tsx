import { IdCard } from "lucide-react";

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

export default async function StudentDirectoryPage() {
  const students = await getAllStudents();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mahasiswa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar teman sekelas alih jenjang.
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title="Belum ada data mahasiswa"
          description="Admin belum menambahkan data mahasiswa."
        />
      ) : (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Daftar mahasiswa</CardTitle>
            <CardDescription>
              {students.length} mahasiswa terdaftar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudentSearchList
              students={students.map((s) => ({
                id: s.id,
                full_name: s.full_name,
                nim: s.nim,
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
