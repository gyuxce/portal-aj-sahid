"use client";

import { useActionState } from "react";

import {
  requestPasswordReset,
  type ForgotPasswordActionState,
} from "@/app/forgot-password/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordActionState,
    FormData
  >(requestPasswordReset, null);

  if (state?.success) {
    return (
      <Alert>
        <AlertDescription>
          Jika email terdaftar, tautan untuk reset password sudah dikirim.
          Periksa kotak masuk Anda.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nama@kampus.ac.id"
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Mengirim..." : "Kirim tautan reset"}
      </Button>
    </form>
  );
}
