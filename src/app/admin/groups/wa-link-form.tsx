"use client";

import { useActionState } from "react";

import { updateGroupWaLink, type ActionState } from "@/lib/actions/groups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WaLinkForm({
  groupId,
  currentLink,
}: {
  groupId: string;
  currentLink: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateGroupWaLink,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="group_id" value={groupId} />
      {state?.error ? (
        <Alert variant="destructive" className="w-full py-1.5">
          <AlertDescription className="text-xs">
            {state.error}
          </AlertDescription>
        </Alert>
      ) : null}
      <Input
        name="wa_group_link"
        type="url"
        defaultValue={currentLink ?? ""}
        placeholder="https://chat.whatsapp.com/..."
        className="h-8 flex-1 min-w-48"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan"}
      </Button>
    </form>
  );
}
