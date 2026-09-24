import { Megaphone, Pin, Plus } from "lucide-react";

import { CreateAnnouncementForm } from "@/app/admin/announcements/create-announcement-form";
import { EditAnnouncementForm } from "@/app/admin/announcements/edit-announcement-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnnouncementBody } from "@/components/dashboard/announcement-body";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  getActiveCoursesForAnnouncementForm,
  getAllAnnouncementsForAdmin,
} from "@/lib/data/announcements";
import { formatDateTime } from "@/lib/format";
import {
  deleteAnnouncement,
  togglePinned,
} from "@/lib/actions/announcements";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AdminAnnouncementsPage() {
  const configured = isSupabaseConfigured();
  const [announcements, courses] = await Promise.all([
    getAllAnnouncementsForAdmin(),
    getActiveCoursesForAnnouncementForm(),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pengumuman
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat pengumuman umum atau khusus satu mata kuliah.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Plus className="size-4.5" strokeWidth={2} />
          </span>
          <div>
            <CardTitle>Buat pengumuman</CardTitle>
            <CardDescription>
              Langsung berstatus published dan tampil ke mahasiswa.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateAnnouncementForm courses={courses} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Buat pengumuman pertama melalui form di atas."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="rounded-3xl">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    {announcement.title}
                  </CardTitle>
                  <CardDescription>
                    {announcement.courseName
                      ? `${announcement.courseCode} · ${announcement.courseName}`
                      : "Pengumuman umum"}{" "}
                    · {formatDateTime(announcement.created_at)}
                  </CardDescription>
                </div>
                {configured ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <form
                      action={togglePinned.bind(
                        null,
                        announcement.id,
                        !announcement.is_pinned,
                      )}
                    >
                      <Button
                        type="submit"
                        variant={announcement.is_pinned ? "default" : "outline"}
                        size="sm"
                        className="gap-1"
                      >
                        <Pin className="size-3.5" strokeWidth={2} />
                        {announcement.is_pinned ? "Disematkan" : "Sematkan"}
                      </Button>
                    </form>
                    <ConfirmDeleteButton
                      onDelete={deleteAnnouncement.bind(
                        null,
                        announcement.id,
                      )}
                    />
                  </div>
                ) : null}
              </CardHeader>
              <CardContent>
                <AnnouncementBody
                  text={announcement.body}
                  imageUrl={announcement.imageUrl}
                />
                {configured ? (
                  <EditAnnouncementForm
                    announcement={announcement}
                    courses={courses}
                  />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
