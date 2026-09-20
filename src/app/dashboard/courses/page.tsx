import { BookOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CoursePreview } from "@/components/dashboard/course-preview";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getActiveCoursesForStudent } from "@/lib/data/courses";

export default async function StudentCoursesPage() {
  const courses = await getActiveCoursesForStudent();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mata Kuliah
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Jadwal dan link kelas yang sedang aktif.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada mata kuliah aktif"
          description="Admin belum menambahkan mata kuliah. Coba lagi nanti."
        />
      ) : (
        courses.map((course) => (
          <Card key={course.id} className="overflow-hidden rounded-3xl">
            <CardContent className="pt-6">
              <CoursePreview course={course} />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
