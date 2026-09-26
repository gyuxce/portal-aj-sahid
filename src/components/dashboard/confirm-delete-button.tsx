"use client";

import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function ConfirmDeleteButton({
  onDelete,
  warning,
}: {
  /** A server action bound to the specific row's id, e.g.
   * `deleteTask.bind(null, task.id)` — safe to pass as a prop since Next.js
   * serializes Server Action references across the Server/Client boundary. */
  onDelete: () => Promise<void>;
  /** Extra warning shown in the popup — use for actions with wider blast
   * radius (e.g. deleting a course cascades to its schedules, links,
   * tasks, groups, and materials). */
  warning?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          />
        }
      >
        Hapus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data ini secara permanen?</AlertDialogTitle>
          <AlertDialogDescription>
            {warning ?? "Tindakan ini tidak bisa dibatalkan."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await onDelete();
                  setOpen(false);
                  toast.add({ title: "Berhasil dihapus.", type: "success" });
                } catch (error) {
                  toast.add({
                    title:
                      error instanceof Error
                        ? error.message
                        : "Gagal menghapus.",
                    type: "error",
                  });
                }
              });
            }}
          >
            {pending ? "Menghapus..." : "Ya, hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
