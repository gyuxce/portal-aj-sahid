import { Megaphone, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnnouncementBody } from "@/components/dashboard/announcement-body";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getPublishedAnnouncementsForStudent } from "@/lib/data/announcements";
import { formatDateTime } from "@/lib/format";

export default async function StudentAnnouncementsPage() {
  const announcements = await getPublishedAnnouncementsForStudent();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pengumuman
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Info umum dan per mata kuliah dari admin.
        </p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Admin belum membuat pengumuman. Coba lagi nanti."
        />
      ) : (
        announcements.map((announcement) => (
          <Card key={announcement.id} className="rounded-3xl">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <span className="brand-gradient mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
                <Megaphone className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{announcement.title}</CardTitle>
                  {announcement.is_pinned ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 rounded-full font-normal"
                    >
                      <Pin className="size-3" strokeWidth={2} />
                      Disematkan
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>
                  {announcement.courseName
                    ? `${announcement.courseCode} · ${announcement.courseName}`
                    : "Pengumuman umum"}{" "}
                  · {formatDateTime(announcement.created_at)}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <AnnouncementBody text={announcement.body} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
