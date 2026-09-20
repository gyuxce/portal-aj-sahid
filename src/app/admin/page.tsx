import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllCoursesForAdmin } from "@/lib/data/courses";

export default async function AdminOverviewPage() {
  const courses = await getAllCoursesForAdmin();
  const activeCount = courses.filter((c) => c.status === "active").length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 py-6">
      <div className="brand-gradient relative overflow-hidden rounded-3xl px-6 py-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-medium text-white/80">
          Panel Admin
        </p>
        <h1 className="relative mt-1 text-2xl font-semibold tracking-tight">
          Kelola data kelas
        </h1>
        <p className="relative mt-2 max-w-sm text-sm text-white/85">
          Mata kuliah, jadwal, dan link kelas untuk mahasiswa alih jenjang.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <CheckCircle2 className="size-5" strokeWidth={2} />
            </span>
            <div>
              <CardDescription>Mata kuliah aktif</CardDescription>
              <CardTitle className="text-2xl">{activeCount}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <BookOpen className="size-5" strokeWidth={2} />
            </span>
            <div>
              <CardDescription>Total mata kuliah</CardDescription>
              <CardTitle className="text-2xl">{courses.length}</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-3xl border-none bg-accent shadow-none">
        <Link href="/admin/courses" className="block">
          <CardContent className="flex items-center gap-4 py-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
              <BookOpen className="size-5" strokeWidth={2} />
            </span>
            <div className="flex-1">
              <p className="font-medium text-accent-foreground">
                Kelola mata kuliah
              </p>
              <p className="text-sm text-muted-foreground">
                Tambah mata kuliah, jadwal, dan link kelas aktif.
              </p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}
