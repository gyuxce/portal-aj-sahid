import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const redirectToParam = params?.redirectTo;
  const redirectTo = Array.isArray(redirectToParam)
    ? redirectToParam[0]
    : redirectToParam;

  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div className="brand-gradient pointer-events-none absolute -top-32 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="brand-gradient mb-4 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/30">
            <GraduationCap className="size-7" strokeWidth={2} />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">
            Portal Kelas Alih Jenjang
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk untuk melihat jadwal, tugas, dan pengumuman kelas.
          </p>
        </div>

        <Card className="rounded-3xl shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Masuk</CardTitle>
            <CardDescription>
              Gunakan email dan password yang diberikan admin kelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSupabaseConfigured() ? (
              <LoginForm redirectTo={redirectTo} />
            ) : (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                Supabase belum dikonfigurasi. Isi{" "}
                <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                dan{" "}
                <code className="font-mono">
                  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
                </code>{" "}
                pada <code className="font-mono">.env.local</code> untuk
                mengaktifkan login.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
