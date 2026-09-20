import Link from "next/link";

import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Card className="rounded-3xl shadow-lg shadow-black/5">
          <CardHeader>
            <CardTitle>Lupa password</CardTitle>
            <CardDescription>
              Masukkan email akun Anda, kami kirim tautan untuk membuat
              password baru.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Mahasiswa login pakai NIM (bukan email asli), jadi tautan reset
              di sini tidak berlaku — minta admin reset password dari panel
              admin.
            </p>
            {isSupabaseConfigured() ? (
              <ForgotPasswordForm />
            ) : (
              <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                Supabase belum dikonfigurasi.
              </p>
            )}
            <Link
              href="/login"
              className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Kembali ke halaman masuk
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
