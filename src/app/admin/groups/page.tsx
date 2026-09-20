import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import { getAllGroupsForAdmin } from "@/lib/data/groups";

export default async function AdminGroupsPage() {
  const [courses, groups] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllGroupsForAdmin(),
  ]);

  const counts = new Map<string, number>();
  for (const g of groups) {
    counts.set(g.course_id, (counts.get(g.course_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kelompok</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih mata kuliah untuk kelola kelompoknya.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah dulu di menu Mata Kuliah."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/admin/groups/${course.id}`}>
              <Card className="h-full rounded-3xl transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full items-center gap-3 py-5">
                  <span className="brand-gradient flex size-11 shrink-0 items-center justify-center rounded-2xl text-white">
                    <Users className="size-5" strokeWidth={2} />
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
                      {course.code} · {counts.get(course.id) ?? 0} kelompok
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
