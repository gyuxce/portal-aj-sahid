import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Crown, MessageCircle, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressBadge } from "@/components/dashboard/progress-badge";
import { getMyGroupsForStudent } from "@/lib/data/groups";
import { formatDateTime } from "@/lib/format";

export default async function StudentCourseGroupsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const allGroups = await getMyGroupsForStudent();
  const groups = allGroups.filter((g) => g.course_id === courseId);

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
        <h1 className="text-2xl font-semibold tracking-tight">
          {courseName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{courseCode}</p>
      </div>

      {groups.map((group) => (
        <Card key={group.id} className="rounded-3xl">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
              <Users className="size-4.5" strokeWidth={2} />
            </span>
            <CardTitle>{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium">Anggota</p>
              <ul className="flex flex-col gap-1.5">
                {group.members.map((member) => (
                  <li
                    key={member.profileId}
                    className="flex items-center gap-2 text-sm"
                  >
                    {member.profileId === group.leader_id ? (
                      <Crown
                        className="size-3.5 text-amber-500"
                        strokeWidth={2}
                      />
                    ) : (
                      <span className="size-3.5" />
                    )}
                    {member.nickname ?? member.fullName}
                  </li>
                ))}
              </ul>
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

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <ClipboardList className="size-3.5 text-muted-foreground" />
                Progres tugas
              </p>
              {group.progress.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada progres yang dicatat admin.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {group.progress.map((item) => (
                    <li
                      key={item.taskId}
                      className="rounded-xl bg-muted/50 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {item.taskTitle}
                        </p>
                        <ProgressBadge status={item.progressStatus} />
                      </div>
                      {item.notes ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Diperbarui {formatDateTime(item.updatedAt)} oleh{" "}
                        {item.updatedByName}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
