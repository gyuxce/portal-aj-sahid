import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, FolderOpen, Plus, Users } from "lucide-react";

import { CreateTaskForm } from "@/app/admin/tasks/create-task-form";
import { EditTaskForm } from "@/app/admin/tasks/edit-task-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { DeadlineBadge } from "@/components/dashboard/deadline-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import {
  getActiveCoursesForTaskForm,
  getAllTasksForAdmin,
} from "@/lib/data/tasks";
import { formatDeadline } from "@/lib/format";
import { deleteTask } from "@/lib/actions/tasks";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminCourseTasksPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { courseId } = await params;
  const [courses, allTasks, coursesForForm] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllTasksForAdmin(),
    getActiveCoursesForTaskForm(),
  ]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    notFound();
  }

  const tasks = allTasks.filter((t) => t.course_id === courseId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Link
        href="/admin/tasks"
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
            <CardTitle>Tambah tugas</CardTitle>
            <CardDescription>
              Tugas baru langsung berstatus aktif.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateTaskForm fixedCourseId={course.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas"
          description="Tambahkan tugas pertama melalui form di atas."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="rounded-3xl">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <ClipboardList className="size-4.5" strokeWidth={2} />
                  </span>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    {task.title}
                    <DeadlineBadge deadline={task.deadline} />
                  </CardTitle>
                </div>
                {configured ? (
                  <ConfirmDeleteButton
                    onDelete={deleteTask.bind(null, task.id)}
                  />
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {task.deadline
                      ? `Deadline: ${formatDeadline(task.deadline)}`
                      : "Tanpa deadline"}
                  </span>
                  <Badge variant="outline" className="gap-1 rounded-full">
                    {task.task_type === "group" ? (
                      <Users className="size-3" strokeWidth={2} />
                    ) : null}
                    {task.task_type === "group" ? "Kelompok" : "Individu"}
                  </Badge>
                </div>
                {task.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
                {task.materials.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {task.materials.map((material) => (
                      <span
                        key={material.id}
                        className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
                      >
                        <FolderOpen className="size-3" strokeWidth={2} />
                        {material.title}
                        {material.status === "archived" ? (
                          <span className="text-muted-foreground">
                            (arsip)
                          </span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                ) : null}
                {configured ? (
                  <EditTaskForm task={task} courses={coursesForForm} />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
