import { z } from "zod";

export const MAX_MATERIAL_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_MATERIAL_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];

export const ALLOWED_MATERIAL_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

// Combined — used where a single upload widget still needs to cover both
// (server-side bucket policy, task's inline "materi pendukung" uploader).
export const ALLOWED_MATERIAL_MIME_TYPES = [
  ...ALLOWED_MATERIAL_DOCUMENT_MIME_TYPES,
  ...ALLOWED_MATERIAL_IMAGE_MIME_TYPES,
];

export const materialSchema = z
  .object({
    course_id: z.uuid({ error: "Mata kuliah tidak valid." }),
    task_id: z.uuid().optional().or(z.literal("")),
    title: z.string().trim().min(1, { error: "Judul materi wajib diisi." }),
    material_type: z.enum(
      ["pdf", "ppt", "doc", "xls", "zip", "photo", "link", "other"],
      { error: "Pilih tipe materi." },
    ),
    meeting_number: z.coerce
      .number()
      .int()
      .min(1, { error: "Pertemuan minimal 1." })
      .max(30, { error: "Pertemuan maksimal 30." })
      .optional(),
    external_url: z.url({ error: "Link tidak valid." }).optional().or(z.literal("")),
    storage_path: z.string().trim().optional().or(z.literal("")),
    file_name: z.string().trim().optional().or(z.literal("")),
    file_size: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => Boolean(data.external_url) || Boolean(data.storage_path), {
    error: "Isi link eksternal atau upload file.",
    path: ["external_url"],
  });

export type MaterialInput = z.infer<typeof materialSchema>;

type MaterialType = MaterialInput["material_type"];

const EXTENSION_TYPE_MAP: Record<string, MaterialType> = {
  pdf: "pdf",
  ppt: "ppt",
  pptx: "ppt",
  doc: "doc",
  docx: "doc",
  xls: "xls",
  xlsx: "xls",
  zip: "zip",
  jpg: "photo",
  jpeg: "photo",
  png: "photo",
  webp: "photo",
  heic: "photo",
};

export function detectMaterialTypeFromFileName(fileName: string): MaterialType {
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase()
    : "";
  return EXTENSION_TYPE_MAP[extension] ?? "other";
}

// Editing only touches metadata — the file/link itself isn't replaceable
// here; delete and re-add if the actual content is wrong.
export const materialUpdateSchema = z.object({
  title: z.string().trim().min(1, { error: "Judul materi wajib diisi." }),
  material_type: z.enum(
    ["pdf", "ppt", "doc", "xls", "zip", "photo", "link", "other"],
    { error: "Pilih tipe materi." },
  ),
  meeting_number: z.coerce
    .number()
    .int()
    .min(1, { error: "Pertemuan minimal 1." })
    .max(30, { error: "Pertemuan maksimal 30." })
    .optional(),
});

export type MaterialUpdateInput = z.infer<typeof materialUpdateSchema>;
