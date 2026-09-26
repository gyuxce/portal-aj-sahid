import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getActiveCoursesForStudent } from "@/lib/data/courses";
import { getActiveMaterialsForStudent } from "@/lib/data/materials";

export default async function StudentMaterialsPage() {
  const [courses, materials] = await Promise.all([
    getActiveCoursesForStudent(),
    getActiveMaterialsForStudent(),
  ]);

  const counts = new Map<string, { materi: number; foto: number }>();
  for (const m of materials) {
    const entry = counts.get(m.course_id) ?? { materi: 0, foto: 0 };
    if (m.material_type === "photo") {
      entry.foto += 1;
    } else {
      entry.materi += 1;
    }
    counts.set(m.course_id, entry);
  }

  function formatCounts(courseId: string) {
    const { materi, foto } = counts.get(courseId) ?? { materi: 0, foto: 0 };
    if (materi === 0 && foto === 0) {
      return "0 materi";
    }
    const parts: string[] = [];
    if (materi > 0) parts.push(`${materi} materi`);
    if (foto > 0) parts.push(`${foto} foto`);
    return parts.join(", ");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Materi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih mata kuliah untuk lihat materinya.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada mata kuliah aktif"
          description="Admin belum menambahkan mata kuliah."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/dashboard/materials/${course.id}`}>
              <Card className="h-full rounded-3xl transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full items-center gap-3 py-5">
                  <span className="brand-gradient flex size-11 shrink-0 items-center justify-center rounded-2xl text-white">
                    <FolderOpen className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{course.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {course.code} · {formatCounts(course.id)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
