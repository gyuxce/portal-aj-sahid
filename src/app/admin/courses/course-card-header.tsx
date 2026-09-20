"use client";

import { useState } from "react";

import { EditCourseForm } from "@/app/admin/courses/edit-course-form";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { CoursePreview } from "@/components/dashboard/course-preview";
import { deleteCourse } from "@/lib/actions/courses";
import type { CourseWithSchedule } from "@/lib/data/courses";

export function CourseCardHeader({
  course,
  canManage,
}: {
  course: CourseWithSchedule;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <CoursePreview course={course} />
        </div>
        {canManage ? (
          <div className="flex shrink-0 items-start gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing((v) => !v)}
            >
              {editing ? "Tutup" : "Edit"}
            </Button>
            <ConfirmDeleteButton
              onDelete={deleteCourse.bind(null, course.id)}
              warning="Ini juga menghapus semua jadwal, link, tugas, kelompok, dan materi mata kuliah ini."
            />
          </div>
        ) : null}
      </div>

      {editing ? (
        <EditCourseForm course={course} onDone={() => setEditing(false)} />
      ) : null}
    </div>
  );
}
