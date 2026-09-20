import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Users } from "lucide-react";

import { CreateGroupForm } from "@/app/admin/groups/create-group-form";
import { GroupCard } from "@/app/admin/groups/group-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import {
  getAllGroupsForAdmin,
  getCourseTaskDeadlines,
  getStudentProfilesForSelect,
} from "@/lib/data/groups";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminCourseGroupsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { courseId } = await params;
  const [courses, allGroups, students, tasks] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllGroupsForAdmin(),
    getStudentProfilesForSelect(),
    getCourseTaskDeadlines(courseId),
  ]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    notFound();
  }

  const groups = allGroups.filter((g) => g.course_id === courseId);

  // One student belongs to at most one group per course, so everyone already
  // placed in this course is greyed out in every picker on this page.
  const takenIds = groups.flatMap((g) => g.members.map((m) => m.profileId));

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Link
        href="/admin/groups"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Semua mata kuliah
      </Link>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {course.name}
          {course.status === "archived" ? (
            <Badge variant="secondary" className="rounded-full">
              Arsip
            </Badge>
          ) : null}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.code}
          {course.lecturer ? ` · ${course.lecturer}` : ""}
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Plus className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <CardTitle>Tambah kelompok</CardTitle>
            <CardDescription>
              Isi nama, pilih anggota, dan link WA sekaligus.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateGroupForm
              courseId={course.id}
              students={students}
              takenIds={takenIds}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada kelompok"
          description="Tambahkan kelompok pertama melalui form di atas."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Users className="size-3.5" />
            {groups.length} kelompok di mata kuliah ini
          </p>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              students={students}
              takenIds={takenIds}
              tasks={tasks}
              configured={configured}
            />
          ))}
        </div>
      )}
    </div>
  );
}
