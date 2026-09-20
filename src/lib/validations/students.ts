import { z } from "zod";

export const bulkStudentSchema = z.object({
  shared_password: z
    .string()
    .min(8, { error: "Password minimal 8 karakter." }),
  raw_list: z.string().trim().min(1, { error: "Daftar mahasiswa kosong." }),
});

export type BulkStudentInput = z.infer<typeof bulkStudentSchema>;

export type ParsedStudentRow = {
  nim: string;
  fullName: string;
};

/** One "NIM, Nama Lengkap" per line. Blank lines are skipped. */
export function parseStudentList(raw: string): ParsedStudentRow[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nim, ...rest] = line.split(",");
      return {
        nim: (nim ?? "").trim(),
        fullName: rest.join(",").trim(),
      };
    });
}

export const resetPasswordSchema = z.object({
  profile_id: z.uuid(),
  new_password: z.string().min(8, { error: "Password minimal 8 karakter." }),
});
