import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Megaphone,
  Pin,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementCarousel } from "@/components/dashboard/announcement-carousel";
import { DeadlineBadge } from "@/components/dashboard/deadline-badge";
import { getCurrentProfile } from "@/lib/dal";
import { getActiveCoursesForStudent } from "@/lib/data/courses";
import { getUpcomingTasksForStudent } from "@/lib/data/tasks";
import { getPublishedAnnouncementsForStudent } from "@/lib/data/announcements";
import { formatDayOfWeek, formatDeadline, formatTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const quickLinks = [
  {
    href: "/dashboard/courses",
    icon: BookOpen,
    title: "Mata kuliah & jadwal",
    description: "Lihat jadwal Jumat/Sabtu dan link kelas aktif.",
  },
  {
    href: "/dashboard/groups",
    icon: Users,
    title: "Kelompok",
    description: "Anggota dan progres tugas kelompokmu.",
  },
  {
    href: "/dashboard/materials",
    icon: FolderOpen,
    title: "Materi",
    description: "Slide dan referensi dari admin.",
  },
];

const DAY_ORDER = ["friday", "saturday"];

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const profile = configured ? await getCurrentProfile() : null;
  const displayName = profile?.full_name ?? "Mahasiswa";
  const [courses, upcomingTasks, announcements] = await Promise.all([
    getActiveCoursesForStudent(),
    getUpcomingTasksForStudent(3),
    getPublishedAnnouncementsForStudent(),
  ]);
  const latestAnnouncements = announcements.slice(0, 2);
  const bannerAnnouncements = announcements
    .filter((a) => a.imageUrl)
    .map((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      imageUrl: a.imageUrl!,
    }));

  const weeklySchedule = courses
    .flatMap((course) =>
      course.schedules.map((schedule) => ({
        schedule,
        courseName: course.name,
        courseCode: course.code,
        activeLink: course.activeLink,
      })),
    )
    .sort((a, b) => {
      const dayDiff =
        DAY_ORDER.indexOf(a.schedule.day_of_week) -
        DAY_ORDER.indexOf(b.schedule.day_of_week);
      return dayDiff !== 0
        ? dayDiff
        : a.schedule.start_time.localeCompare(b.schedule.start_time);
    });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-6 size-40 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-medium text-white/80">
          Halo, {displayName.split(" ")[0]} 👋
        </p>
        <h1 className="relative mt-1 text-2xl font-semibold tracking-tight">
          Selamat datang kembali
        </h1>
        <p className="relative mt-2 max-w-sm text-sm text-white/85">
          Semua jadwal, tugas, dan info kelas alih jenjang ada di satu tempat.
        </p>
      </div>

      <AnnouncementCarousel announcements={bannerAnnouncements} />

      {weeklySchedule.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Jadwal minggu ini
            </p>
            <Link
              href="/dashboard/courses"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <Card className="rounded-3xl">
            <CardContent className="flex flex-col divide-y divide-border py-0">
              {weeklySchedule.map((item) => (
                <div
                  key={item.schedule.id}
                  className="flex items-center gap-3 py-3 first:pt-4 last:pb-4"
                >
                  <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Calendar className="size-3.5" strokeWidth={2} />
                    <span className="text-[10px] font-medium">
                      {formatDayOfWeek(item.schedule.day_of_week).slice(0, 3)}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.courseName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDayOfWeek(item.schedule.day_of_week)},{" "}
                      {formatTime(item.schedule.start_time)}–
                      {formatTime(item.schedule.end_time)}
                      {item.schedule.note ? ` · ${item.schedule.note}` : ""}
                    </p>
                  </div>
                  {item.activeLink ? (
                    <a
                      href={item.activeLink.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm shadow-primary/30 transition-opacity hover:opacity-90"
                    >
                      Buka
                      <ExternalLink className="size-3" strokeWidth={2} />
                    </a>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {latestAnnouncements.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Pengumuman terbaru
            </p>
            <Link
              href="/dashboard/announcements"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {latestAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-3 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Megaphone className="size-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {announcement.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {announcement.courseName ?? "Pengumuman umum"}
                    </p>
                  </div>
                  {announcement.is_pinned ? (
                    <Badge variant="secondary" className="gap-1 rounded-full">
                      <Pin className="size-3" strokeWidth={2} />
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Tugas terdekat
          </p>
          {upcomingTasks.length > 0 ? (
            <Link
              href="/dashboard/tasks"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Lihat semua
            </Link>
          ) : null}
        </div>

        {upcomingTasks.length === 0 ? (
          <Card className="rounded-2xl border-dashed bg-transparent shadow-none">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Belum ada tugas aktif.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {upcomingTasks.map((task) => (
              <Card key={task.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-3 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <ClipboardList className="size-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.courseCode} · {formatDeadline(task.deadline)}
                    </p>
                  </div>
                  <DeadlineBadge deadline={task.deadline} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Akses cepat
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Card
              key={link.href}
              className="overflow-hidden rounded-2xl border-none bg-accent shadow-none"
            >
              <Link href={link.href} className="block h-full">
                <CardContent className="flex h-full flex-col gap-3 py-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                      <link.icon className="size-4.5" strokeWidth={2} />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-accent-foreground">
                      {link.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
