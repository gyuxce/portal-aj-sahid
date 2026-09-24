import { z } from "zod";

export const MAX_ANNOUNCEMENT_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_ANNOUNCEMENT_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const announcementSchema = z.object({
  course_id: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(1, { error: "Judul pengumuman wajib diisi." }),
  body: z.string().trim().min(1, { error: "Isi pengumuman wajib diisi." }),
  is_pinned: z.enum(["on"]).optional(),
  image_path: z.string().trim().optional().or(z.literal("")),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

export const announcementUpdateSchema = announcementSchema.extend({
  remove_image: z.enum(["on"]).optional(),
});

export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;
