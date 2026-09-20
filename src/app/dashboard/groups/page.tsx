import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getMyGroupsForStudent } from "@/lib/data/groups";

export default async function StudentGroupsPage() {
  const groups = await getMyGroupsForStudent();

  const courses = new Map<
    string,
    { id: string; name: string; code: string; count: number }
  >();
  for (const g of groups) {
    const existing = courses.get(g.course_id);
    if (existing) {
      existing.count += 1;
    } else {
      courses.set(g.course_id, {
        id: g.course_id,
        name: g.courseName,
        code: g.courseCode,
        count: 1,
      });
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kelompok</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih mata kuliah untuk lihat kelompokmu.
        </p>
      </div>

      {courses.size === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum tergabung di kelompok manapun"
          description="Admin belum memasukkanmu ke kelompok. Hubungi admin kelas kalau ini keliru."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...courses.values()].map((course) => (
            <Link key={course.id} href={`/dashboard/groups/${course.id}`}>
              <Card className="h-full rounded-3xl transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full items-center gap-3 py-5">
                  <span className="brand-gradient flex size-11 shrink-0 items-center justify-center rounded-2xl text-white">
                    <Users className="size-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{course.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {course.code} · {course.count} kelompok
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
