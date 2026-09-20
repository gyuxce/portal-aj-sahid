"use client";

import {
  CalendarClock,
  ChevronDown,
  MessageCircle,
  Settings2,
  Users,
  X,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { EditGroupForm } from "@/app/admin/groups/edit-group-form";
import { PresentationScheduleForm } from "@/app/admin/groups/presentation-schedule-form";
import { deleteGroup, removeGroupMember } from "@/lib/actions/groups";
import { formatDeadline } from "@/lib/format";
import type { CourseTaskDeadline, GroupWithDetails } from "@/lib/data/groups";

export function GroupCard({
  group,
  students,
  takenIds,
  tasks,
  configured,
}: {
  group: GroupWithDetails;
  students: { id: string; full_name: string }[];
  takenIds: string[];
  tasks: CourseTaskDeadline[];
  configured: boolean;
}) {
  const needsSetup = group.members.length === 0;

  return (
    <Card className="overflow-hidden rounded-3xl p-0">
      {/* Empty groups open by default so the admin lands straight on the
       * member picker; filled groups stay collapsed to a one-line summary
       * so a long list of "done" groups doesn't turn into a wall of forms. */}
      <Collapsible defaultOpen={needsSetup}>
        <div className="flex items-center gap-1 pr-3">
          <CollapsibleTrigger
            className="group flex min-w-0 flex-1 items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-muted/40"
            render={<button type="button" />}
          >
            <span className="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-2xl text-white">
              <Users className="size-4.5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{group.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {needsSetup
                  ? "Belum ada anggota"
                  : group.members.map((m) => m.fullName).join(", ")}
              </p>
            </div>
            {group.wa_group_link ? (
              <Badge variant="secondary" className="shrink-0 rounded-full">
                WA tersambung
              </Badge>
            ) : null}
            <ChevronDown
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180"
              strokeWidth={2}
            />
          </CollapsibleTrigger>
          {configured ? (
            <ConfirmDeleteButton
              onDelete={deleteGroup.bind(null, group.id)}
              warning={`Ini menghapus kelompok "${group.name}" beserta semua keanggotaannya. Tugas dan mata kuliah terkait tidak ikut terhapus.`}
            />
          ) : null}
        </div>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-5 pt-0 pb-6">
            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Anggota</p>
              {needsSetup ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada anggota.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {group.members.map((member) => (
                    <li
                      key={member.profileId}
                      className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-1.5 text-sm"
                    >
                      {member.fullName}
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
                            aria-label={`Hapus ${member.fullName} dari kelompok`}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada link grup WhatsApp.
              </p>
            )}

            <Separator />

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <CalendarClock className="size-3.5 text-muted-foreground" />
                Jadwal presentasi kelompok
              </p>
              {configured ? (
                <PresentationScheduleForm
                  groupId={group.id}
                  currentPresentationAt={group.presentation_at}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sambungkan Supabase untuk mengaktifkan aksi ini.
                </p>
              )}
            </div>

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
                        {formatDeadline(task.deadline)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {configured ? (
              <>
                <Separator />

                {/* Adding members / changing the WA link is a rarer,
                 * deliberate action, so it stays tucked away once the group
                 * already has people in it — the member list and WA button
                 * above cover what the admin checks day-to-day. */}
                <Collapsible defaultOpen={needsSetup}>
                  <CollapsibleTrigger
                    className="group flex w-fit items-center gap-1.5 text-sm font-medium text-primary"
                    render={<button type="button" />}
                  >
                    <Settings2 className="size-3.5" strokeWidth={2} />
                    Ubah nama, anggota & link WA
                    <ChevronDown
                      className="size-3.5 transition-transform group-data-[panel-open]:rotate-180"
                      strokeWidth={2}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-3">
                      <EditGroupForm
                        key={group.members.map((m) => m.profileId).join(",")}
                        groupId={group.id}
                        currentName={group.name}
                        students={students}
                        takenIds={takenIds}
                        currentLink={group.wa_group_link}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sambungkan Supabase untuk mengaktifkan aksi ini.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
