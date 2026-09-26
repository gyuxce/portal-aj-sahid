import { z } from "zod";

export const taskSchema = z.object({
  task_code: z
    .string()
    .trim()
    .min(1, { error: "Kode tugas wajib diisi." })
    .max(30, { error: "Kode maksimal 30 karakter." }),
  course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
  title: z.string().trim().min(1, { error: "Judul tugas wajib diisi." }),
  task_type: z.enum(["individual", "group"], {
    error: "Pilih jenis tugas.",
  }),
  description: z.string().trim().optional().or(z.literal("")),
  // Opsional — sebagian tugas belum punya tanggal pasti dari dosen.
  deadline: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      error: "Format deadline tidak valid.",
    }),
});

export type TaskInput = z.infer<typeof taskSchema>;

export const taskUpdateSchema = taskSchema.omit({ task_code: true });

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
