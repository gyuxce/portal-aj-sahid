"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function DashboardHomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <Alert variant="destructive">
        <AlertTitle>Gagal memuat beranda</AlertTitle>
        <AlertDescription>
          Terjadi masalah saat mengambil data dari server. Coba lagi.
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline" className="w-fit">
        Coba lagi
      </Button>
    </div>
  );
}
