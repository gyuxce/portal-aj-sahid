import { z } from "zod";

const waLink = z.url({ error: "Link WA tidak valid." }).optional().or(z.literal(""));

// Presentation schedule is per group (not per task — see updateGroupSchema
// comment), so it's a plain optional datetime-local string like the task
// deadline input, just not required.
const presentationAt = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    error: "Format jadwal presentasi tidak valid.",
  });

export const groupSchema = z.object({
  course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
  name: z.string().trim().min(1, { error: "Nama kelompok wajib diisi." }),
  wa_group_link: waLink,
  profile_ids: z.array(z.uuid()).optional().default([]),
});

export type GroupInput = z.infer<typeof groupSchema>;

// Members, the WhatsApp link, and the presentation schedule are saved by one
// submit — previously three separate forms with three "Simpan" buttons for
// the same group.
export const updateGroupSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  profile_ids: z.array(z.uuid()).optional().default([]),
  wa_group_link: waLink,
  presentation_at: presentationAt,
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
