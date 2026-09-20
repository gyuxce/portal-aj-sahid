import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import { getAllTasksForAdmin } from "@/lib/data/tasks";

export default async function AdminTasksPage() {
  const [courses, tasks] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllTasksForAdmin(),
  ]);

  const counts = new Map<string, number>();
  for (const t of tasks) {
    counts.set(t.course_id, (counts.get(t.course_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tugas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih mata kuliah untuk kelola tugasnya.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah dulu di menu Mata Kuliah."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/admin/tasks/${course.id}`}>
              <Card className="h-full rounded-3xl transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full items-center gap-3 py-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <ClipboardList className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{course.name}</p>
                      {course.status === "archived" ? (
                        <Badge variant="secondary" className="rounded-full">
                          Arsip
                        </Badge>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {course.code} · {counts.get(course.id) ?? 0} tugas
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
