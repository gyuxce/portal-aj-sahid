import { z } from "zod";

export const loginSchema = z.object({
  // Admin logs in with a real email; students log in with their NIM (see
  // src/lib/constants.ts for how a NIM is turned into a Supabase Auth email).
  identifier: z
    .string()
    .trim()
    .min(1, { error: "Masukkan email atau NIM." }),
  password: z
    .string()
    .min(8, { error: "Password minimal 8 karakter." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Masukkan email yang valid." }).trim(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { error: "Password minimal 8 karakter." }),
    confirmPassword: z.string().min(8, { error: "Password minimal 8 karakter." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Konfirmasi password tidak sama.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
