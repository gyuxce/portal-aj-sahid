import { BookOpen, Calendar, Link2, Plus } from "lucide-react";

import { AddScheduleForm } from "@/app/admin/courses/add-schedule-form";
import { CourseCardHeader } from "@/app/admin/courses/course-card-header";
import { CreateCourseForm } from "@/app/admin/courses/create-course-form";
import { SetCourseLinkForm } from "@/app/admin/courses/set-course-link-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Separator } from "@/components/ui/separator";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import { formatDayOfWeek, formatTime } from "@/lib/format";
import { setScheduleActive } from "@/lib/actions/courses";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminCoursesPage() {
  const configured = isSupabaseConfigured();
  const courses = await getAllCoursesForAdmin();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mata Kuliah
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bagian atas tiap kartu persis yang dilihat mahasiswa. &ldquo;Kelola&rdquo;
          di bawahnya khusus admin.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Plus className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <CardTitle>Tambah mata kuliah</CardTitle>
            <CardDescription>
              Mata kuliah baru langsung berstatus aktif.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateCourseForm />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah pertama melalui form di atas."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="rounded-3xl">
              <CardContent className="flex flex-col gap-5 pt-6">
                <CourseCardHeader course={course} canManage={configured} />

                <Separator />

                <div className="flex flex-col gap-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Kelola (khusus admin)
                  </p>

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      Jadwal
                    </p>
                    {course.schedules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Belum ada jadwal.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {course.schedules.map((schedule) => (
                          <li
                            key={schedule.id}
                            className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm"
                          >
                            <span>
                              {formatDayOfWeek(schedule.day_of_week)},{" "}
                              {formatTime(schedule.start_time)}–
                              {formatTime(schedule.end_time)}
                              {schedule.note ? ` · ${schedule.note}` : ""}
                              {!schedule.is_active ? (
                                <span className="ml-2 text-muted-foreground">
                                  (nonaktif)
                                </span>
                              ) : null}
                            </span>
                            {configured ? (
                              <form
                                action={setScheduleActive.bind(
                                  null,
                                  schedule.id,
                                  !schedule.is_active,
                                )}
                              >
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7"
                                >
                                  {schedule.is_active
                                    ? "Nonaktifkan"
                                    : "Aktifkan"}
                                </Button>
                              </form>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                    {configured ? (
                      <div className="mt-3">
                        <AddScheduleForm courseId={course.id} />
                      </div>
                    ) : null}
                  </div>

                  <Separator />

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                      <Link2 className="size-3.5 text-muted-foreground" />
                      Ganti link aktif
                    </p>
                    {configured ? (
                      <SetCourseLinkForm courseId={course.id} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sambungkan Supabase untuk mengaktifkan aksi ini.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
