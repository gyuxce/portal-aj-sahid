import { z } from "zod";

export const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { error: "Kode mata kuliah wajib diisi." })
    .max(20, { error: "Kode maksimal 20 karakter." }),
  name: z.string().trim().min(1, { error: "Nama mata kuliah wajib diisi." }),
  lecturer: z.string().trim().optional().or(z.literal("")),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const scheduleSchema = z
  .object({
    course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
    day_of_week: z.enum(["friday", "saturday"], {
      error: "Pilih hari Jumat atau Sabtu.",
    }),
    start_time: z.string().min(1, { error: "Jam mulai wajib diisi." }),
    end_time: z.string().min(1, { error: "Jam selesai wajib diisi." }),
    note: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.end_time > data.start_time, {
    error: "Jam selesai harus setelah jam mulai.",
    path: ["end_time"],
  });

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export const courseLinkSchema = z.object({
  course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
  url: z.url({ error: "URL tidak valid." }),
  label: z.string().trim().optional().or(z.literal("")),
});

export type CourseLinkInput = z.infer<typeof courseLinkSchema>;
