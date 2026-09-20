"use client";

import { useActionState, useState } from "react";

import {
  resetStudentPassword,
  type ResetPasswordState,
} from "@/lib/actions/students";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    ResetPasswordState,
    FormData
  >(resetStudentPassword, null);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Reset password
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="profile_id" value={profileId} />
      {state?.error ? (
        <Alert variant="destructive" className="py-1.5">
          <AlertDescription className="text-xs">
            {state.error}
          </AlertDescription>
        </Alert>
      ) : null}
      {state?.success ? (
        <span className="text-xs text-emerald-600">Tersimpan</span>
      ) : null}
      <Input
        name="new_password"
        placeholder="Password baru"
        className="h-8 w-36"
        required
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "..." : "Simpan"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        Batal
      </Button>
    </form>
  );
}
