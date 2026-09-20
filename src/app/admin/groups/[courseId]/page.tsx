import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, MessageCircle, Plus, Users, X } from "lucide-react";

import { AddMemberForm } from "@/app/admin/groups/add-member-form";
import { CreateGroupForm } from "@/app/admin/groups/create-group-form";
import { UpdateProgressForm } from "@/app/admin/groups/update-progress-form";
import { WaLinkForm } from "@/app/admin/groups/wa-link-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getAllCoursesForAdmin } from "@/lib/data/courses";
import {
  getActiveTasksForGroupForm,
  getAllGroupsForAdmin,
  getStudentProfilesForSelect,
  type GroupWithDetails,
} from "@/lib/data/groups";
import { removeGroupMember } from "@/lib/actions/groups";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function GroupCard({
  group,
  allStudents,
  configured,
}: {
  group: GroupWithDetails;
  allStudents: { id: string; full_name: string }[];
  configured: boolean;
}) {
  const memberIds = new Set(group.members.map((m) => m.profileId));
  const availableStudents = allStudents.filter((s) => !memberIds.has(s.id));
  const courseTasks = configured
    ? await getActiveTasksForGroupForm(group.course_id)
    : [{ id: "dummy-task-2", title: "Tugas Kelompok 1: ERD" }];

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <span className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
          <Users className="size-4.5" strokeWidth={2} />
        </span>
        <CardTitle>{group.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium">Anggota</p>
          <ul className="mb-3 flex flex-col gap-1.5">
            {group.members.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                Belum ada anggota.
              </li>
            ) : (
              group.members.map((member) => (
                <li
                  key={member.profileId}
                  className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span className="flex items-center gap-1.5">
                    {member.profileId === group.leader_id ? (
                      <Crown
                        className="size-3.5 text-amber-500"
                        strokeWidth={2}
                      />
                    ) : null}
                    {member.fullName}
                  </span>
                  {configured ? (
                    <form
                      action={removeGroupMember.bind(
                        null,
                        group.id,
                        member.profileId,
                      )}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Hapus anggota"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </form>
                  ) : null}
                </li>
              ))
            )}
          </ul>
          {configured ? (
            <AddMemberForm
              key={`${group.id}:${group.leader_id ?? ""}:${group.members
                .map((m) => m.profileId)
                .join(",")}`}
              groupId={group.id}
              availableStudents={availableStudents}
              currentMembers={group.members.map((m) => ({
                id: m.profileId,
                full_name: m.fullName,
              }))}
              currentLeaderId={group.leader_id}
            />
          ) : null}
        </div>

        <Separator />

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <MessageCircle className="size-3.5 text-muted-foreground" />
            Link grup WhatsApp
          </p>
          {configured ? (
            <WaLinkForm groupId={group.id} currentLink={group.wa_group_link} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm font-medium">Progres tugas</p>
          {courseTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada tugas aktif di mata kuliah ini.
            </p>
          ) : configured ? (
            <div className="flex flex-col gap-2">
              {courseTasks.map((task) => {
                const existing = group.progress.find(
                  (p) => p.taskId === task.id,
                );
                return (
                  <UpdateProgressForm
                    key={task.id}
                    groupId={group.id}
                    taskId={task.id}
                    taskTitle={task.title}
                    currentStatus={existing?.progressStatus}
                    currentNotes={existing?.notes}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminCourseGroupsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { courseId } = await params;
  const [courses, allGroups, students] = await Promise.all([
    getAllCoursesForAdmin(),
    getAllGroupsForAdmin(),
    getStudentProfilesForSelect(),
  ]);

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    notFound();
  }

  const groups = allGroups.filter((g) => g.course_id === courseId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <Link
        href="/admin/groups"
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
            <CardTitle>Tambah kelompok</CardTitle>
            <CardDescription>
              Kelompok baru langsung terikat ke mata kuliah ini.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {configured ? (
            <CreateGroupForm fixedCourseId={course.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sambungkan Supabase untuk mengaktifkan aksi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada kelompok"
          description="Tambahkan kelompok pertama melalui form di atas."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              allStudents={students}
              configured={configured}
            />
          ))}
        </div>
      )}
    </div>
  );
}
