import { z } from "zod";

export const announcementSchema = z.object({
  course_id: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(1, { error: "Judul pengumuman wajib diisi." }),
  body: z.string().trim().min(1, { error: "Isi pengumuman wajib diisi." }),
  is_pinned: z.enum(["on"]).optional(),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
