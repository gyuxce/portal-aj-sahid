import { z } from "zod";

const waLink = z.url({ error: "Link WA tidak valid." }).optional().or(z.literal(""));

// Presentation schedule is per group (not per task — see updateGroupSchema
// comment), so it's a plain optional date string like the task deadline
// input, just not required. .nullish() (not just .optional()) because an
// empty <input type="date"> can come through formData.get() as null rather
// than "" depending on how the field is submitted — z's .optional() alone
// rejects null and that was surfacing as "Format tidak valid" on every save
// with no date picked.
const presentationAt = z
  .string()
  .nullish()
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

// Members, the WhatsApp link, and the group's name are saved by one submit —
// previously three separate forms with three "Simpan" buttons for the same
// group.
export const updateGroupSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  name: z.string().trim().min(1, { error: "Nama kelompok wajib diisi." }),
  profile_ids: z.array(z.uuid()).optional().default([]),
  wa_group_link: waLink,
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

// Its own tiny form/action — bundling this into updateGroupSchema made the
// member-picker form the only way to reach a field admins adjust often
// (closer to presentation day), while members/WA link change rarely.
export const presentationScheduleSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  presentation_at: presentationAt,
});

export type PresentationScheduleInput = z.infer<
  typeof presentationScheduleSchema
>;
