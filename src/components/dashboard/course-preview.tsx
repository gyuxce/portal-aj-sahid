import { BookOpen, Calendar, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDayOfWeek, formatTime } from "@/lib/format";
import type { CourseWithSchedule } from "@/lib/data/courses";

/**
 * Renders a course exactly the way a student sees it on /dashboard/courses.
 * Used as-is (unstyled wrapper, no Card) inside both the student page and
 * the admin page, so admin never has to guess whether the management view
 * matches what students actually see — it's the same component either way.
 * Schedules are filtered to `is_active` here (not by the caller) because
 * the admin data fetch intentionally includes inactive ones for management.
 */
export function CoursePreview({ course }: { course: CourseWithSchedule }) {
  const activeSchedules = course.schedules.filter((s) => s.is_active);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="brand-gradient mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
          <BookOpen className="size-4.5" strokeWidth={2} />
        </span>
        <div>
          <p className="font-semibold leading-tight">{course.name}</p>
          <p className="text-sm text-muted-foreground">
            {course.code}
            {course.lecturer ? ` · ${course.lecturer}` : ""}
          </p>
        </div>
      </div>

      {activeSchedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Jadwal belum tersedia.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activeSchedules.map((schedule) => (
            <Badge
              key={schedule.id}
              variant="secondary"
              className="gap-1.5 rounded-full font-normal"
            >
              <Calendar className="size-3" strokeWidth={2} />
              {formatDayOfWeek(schedule.day_of_week)}{" "}
              {formatTime(schedule.start_time)}–
              {formatTime(schedule.end_time)}
              {schedule.note ? ` · ${schedule.note}` : ""}
            </Badge>
          ))}
        </div>
      )}

      {course.activeLink ? (
        <a
          href={course.activeLink.url}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition-opacity hover:opacity-90"
        >
          {course.activeLink.label ?? "Buka link kelas"}
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">
          Link kelas belum tersedia.
        </p>
      )}
    </div>
  );
}
