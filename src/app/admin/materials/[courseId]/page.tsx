import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Camera, Eye, FolderOpen, Plus } from "lucide-react";

import { CreateMaterialForm } from "@/app/admin/materials/create-material-form";
import { CreatePhotoForm } from "@/app/admin/materials/create-photo-form";
import { EditMaterialForm } from "@/app/admin/materials/edit-material-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
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
  getAllMaterialsForAdmin,
  groupMaterialsByCourseAndMeeting,
} from "@/lib/data/materials";
import { formatMaterialType } from "@/lib/format";
import { deleteMaterial } from "@/lib/actions/materials";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminCourseMaterialsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { courseId } = await params;
  const [courses, materials] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllMaterialsForAdmin(),
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
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Link
        href="/admin/materials"
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
            <CardTitle>Tambah materi</CardTitle>
            <CardDescription>
              Upload file langsung (maks 50MB) atau paste link eksternal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateMaterialForm courseId={course.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Camera className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <CardTitle>Tambah foto</CardTitle>
            <CardDescription>
              Screenshot bukti hadir Zoom atau dokumentasi lain — tetap masuk ke pertemuan yang sama.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreatePhotoForm courseId={course.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {meetings.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada materi"
          description="Tambahkan materi pertama melalui form di atas."
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
                <Card key={material.id} className="rounded-2xl">
                  <CardContent className="flex flex-wrap items-center gap-3 py-4">
                    {isPhoto && href ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={href}
                        alt={material.title}
                        className="size-10 shrink-0 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                        <FolderOpen className="size-4.5" strokeWidth={2} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">
                          {material.title}
                        </p>
                        <Badge variant="outline" className="rounded-full">
                          {formatMaterialType(material.material_type)}
                        </Badge>
                      </div>
                      {material.file_name ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {material.file_name}
                        </p>
                      ) : null}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Lihat file"
                        title="Lihat file"
                      >
                        <Eye className="size-4" />
                      </a>
                    ) : null}
                    {configured ? (
                      <div className="flex items-center gap-1">
                        <EditMaterialForm material={material} />
                        <ConfirmDeleteButton
                          onDelete={deleteMaterial.bind(null, material.id)}
                        />
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
