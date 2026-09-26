import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MessageCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentProfile } from "@/lib/dal";
import { getAllGroups, getCourseTaskDeadlines } from "@/lib/data/groups";
import { formatDeadline } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function StudentCourseGroupsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const [groups, tasks, profile] = await Promise.all([
    getAllGroups(courseId),
    getCourseTaskDeadlines(courseId),
    isSupabaseConfigured() ? getCurrentProfile() : null,
  ]);

  if (groups.length === 0) {
    notFound();
  }

  const { courseName, courseCode } = groups[0];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <Link
        href="/dashboard/groups"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={2} />
        Semua mata kuliah
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{courseName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{courseCode}</p>
      </div>

      {groups.map((group) => {
        const isMine = profile
          ? group.members.some((m) => m.profileId === profile.id)
          : false;

        return (
          <Card key={group.id} className="rounded-3xl">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
                <Users className="size-4.5" strokeWidth={2} />
              </span>
              <div className="flex flex-1 items-center gap-2">
                <CardTitle>{group.name}</CardTitle>
                {isMine ? (
                  <Badge className="rounded-full">Kelompokmu</Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-sm font-medium">Anggota</p>
                {group.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada anggota.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {group.members.map((member) => (
                      <li key={member.profileId} className="text-sm">
                        {member.nickname ?? member.fullName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {group.notes ? (
                <p className="text-sm text-muted-foreground">{group.notes}</p>
              ) : null}

              {group.wa_group_link ? (
                <a
                  href={group.wa_group_link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="size-3.5" strokeWidth={2} />
                  Buka Grup WhatsApp
                </a>
              ) : null}

              <Separator />

              {group.presentation_at ? (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <CalendarClock className="size-3.5 text-muted-foreground" />
                    Jadwal presentasi kelompok
                  </p>
                  <p className="text-sm">
                    {formatDeadline(group.presentation_at)}
                  </p>
                </div>
              ) : null}

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <CalendarClock className="size-3.5 text-muted-foreground" />
                  Deadline tugas
                </p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada tugas aktif di mata kuliah ini.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{task.title}</span>
                        <span className="text-muted-foreground">
                          {task.deadline
                            ? formatDeadline(task.deadline)
                            : "Tanpa deadline"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
