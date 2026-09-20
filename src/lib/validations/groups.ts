import { z } from "zod";

export const groupSchema = z.object({
  course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
  name: z.string().trim().min(1, { error: "Nama kelompok wajib diisi." }),
  notes: z.string().trim().optional().or(z.literal("")),
  wa_group_link: z
    .url({ error: "Link WA tidak valid." })
    .optional()
    .or(z.literal("")),
});

export type GroupInput = z.infer<typeof groupSchema>;

export const waLinkSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  wa_group_link: z
    .url({ error: "Link WA tidak valid." })
    .optional()
    .or(z.literal("")),
});

// Adding members and assigning the leader are done in a single form/submit
// (previously two separate saves, which read as duplicate/confusing input),
// so profile_ids may be empty when the admin only changes the leader.
export const manageMembersSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  profile_ids: z.array(z.uuid()).optional().default([]),
  leader_id: z.uuid().optional().or(z.literal("")),
});

export type ManageMembersInput = z.infer<typeof manageMembersSchema>;

export const progressSchema = z.object({
  group_id: z.uuid({ error: "Kelompok tidak valid." }),
  task_id: z.uuid({ error: "Tugas tidak valid." }),
  progress_status: z.enum(["not_started", "in_progress", "done"], {
    error: "Pilih status progres.",
  }),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ProgressInput = z.infer<typeof progressSchema>;
