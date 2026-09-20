import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ResetPasswordPage() {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/forgot-password");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="rounded-3xl shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Buat password baru</CardTitle>
            <CardDescription>
              Password baru berlaku langsung setelah disimpan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSupabaseConfigured() ? (
              <ResetPasswordForm />
            ) : (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                Supabase belum dikonfigurasi.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
