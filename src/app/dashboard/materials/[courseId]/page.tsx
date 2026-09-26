import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getActiveCoursesForStudent } from "@/lib/data/courses";
import {
  getActiveMaterialsForStudent,
  groupMaterialsByCourseAndMeeting,
} from "@/lib/data/materials";
import { formatMaterialType } from "@/lib/format";

export default async function StudentCourseMaterialsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [courses, materials] = await Promise.all([
    getActiveCoursesForStudent(),
    getActiveMaterialsForStudent(),
  ]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    notFound();
  }

  const grouped = groupMaterialsByCourseAndMeeting(
    materials.filter((m) => m.course_id === courseId),
  );
  const meetings = grouped[0]?.meetings ?? [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <Link
        href="/dashboard/materials"
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

      {meetings.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada materi"
          description="Admin belum menambahkan materi untuk mata kuliah ini."
        />
      ) : (
        meetings.map((meeting) => (
          <div key={meeting.meetingNumber ?? "lainnya"}>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {meeting.meetingNumber
                ? `Pertemuan ${meeting.meetingNumber}`
                : "Lainnya"}
            </p>
            <div className="flex flex-col gap-2">
              {meeting.materials.map((material) => {
                const href = material.external_url ?? material.fileUrl;
                const isPhoto = material.material_type === "photo";
                return (
                  <a
                    key={material.id}
                    href={href ?? "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={href ? "block" : "pointer-events-none block"}
                    aria-label={`Lihat ${material.title}`}
                  >
                    <Card className="rounded-2xl transition-colors hover:bg-muted/40">
                      <CardContent className="flex items-center gap-3 py-4">
                        {isPhoto && href ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={href}
                            alt={material.title}
                            className="size-10 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
                            <FolderOpen className="size-4.5" strokeWidth={2} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {material.title}
                          </p>
                          {material.file_name ? (
                            <p className="truncate text-sm text-muted-foreground">
                              {material.file_name}
                            </p>
                          ) : null}
                        </div>
                        <Badge variant="outline" className="rounded-full">
                          {formatMaterialType(material.material_type)}
                        </Badge>
                        <Eye className="size-4 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
