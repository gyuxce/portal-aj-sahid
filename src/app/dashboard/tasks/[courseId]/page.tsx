import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  FolderOpen,
  MessageCircle,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DeadlineBadge } from "@/components/dashboard/deadline-badge";
import { getActiveCoursesForStudent } from "@/lib/data/courses";
import { getActiveTasksForStudent } from "@/lib/data/tasks";
import { formatDeadline } from "@/lib/format";

export default async function StudentCourseTasksPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [courses, allTasks] = await Promise.all([
    getActiveCoursesForStudent(),
    getActiveTasksForStudent(),
  ]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    notFound();
  }

  const tasks = allTasks.filter((t) => t.course_id === courseId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <Link
        href="/dashboard/tasks"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Semua mata kuliah
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {course.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {course.code}
          {course.lecturer ? ` · ${course.lecturer}` : ""}
        </p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas aktif"
          description="Admin belum menambahkan tugas untuk mata kuliah ini."
        />
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="rounded-3xl">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <ClipboardList className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{task.title}</CardTitle>
                  <DeadlineBadge deadline={task.deadline} />
                </div>
                <CardDescription>
                  {task.deadline
                    ? `Deadline: ${formatDeadline(task.deadline)}`
                    : "Tanpa deadline"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {task.description ? (
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-1 rounded-full">
                  {task.task_type === "group" ? (
                    <Users className="size-3" strokeWidth={2} />
                  ) : null}
                  {task.task_type === "group" ? "Kelompok" : "Individu"}
                </Badge>
              </div>
              {task.materials.length > 0 ? (
                <div className="flex flex-col gap-1.5 pt-1">
                  {task.materials.map((material) =>
                    material.href ? (
                      <a
                        key={material.id}
                        href={material.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
                      >
                        <FolderOpen className="size-3" strokeWidth={2} />
                        {material.title}
                      </a>
                    ) : null,
                  )}
                </div>
              ) : null}

              {task.myGroup ? (
                <div className="mt-1 rounded-2xl bg-muted/50 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                    <Users className="size-3.5 text-muted-foreground" />
                    Kelompokmu: {task.myGroup.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {task.myGroup.members
                      .map((m) => m.nickname ?? m.fullName)
                      .join(", ")}
                  </p>
                  {task.myGroup.waGroupLink ? (
                    <a
                      href={task.myGroup.waGroupLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                    >
                      <MessageCircle className="size-3" strokeWidth={2} />
                      Buka Grup WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
