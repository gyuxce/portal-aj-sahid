import { z } from "zod";

const waLink = z.url({ error: "Link WA tidak valid." }).optional().or(z.literal(""));

export const groupSchema = z.object({
  course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
  name: z.string().trim().min(1, { error: "Nama kelompok wajib diisi." }),
  notes: z.string().trim().optional().or(z.literal("")),
  wa_group_link: waLink,
  profile_ids: z.array(z.uuid()).optional().default([]),
});

export type GroupInput = z.infer<typeof groupSchema>;

// Members and the WhatsApp link are saved by one submit — previously three
// separate forms with three "Simpan" buttons for the same group.
export const updateGroupSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  profile_ids: z.array(z.uuid()).optional().default([]),
  wa_group_link: waLink,
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
