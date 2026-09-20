"use server";

import { redirect } from "next/navigation";

import { nimToSyntheticEmail } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export type LoginActionState = {
  error?: string;
} | null;

function isSafeRedirect(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

export async function login(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email/NIM atau password tidak valid." };
  }

  const email = parsed.data.identifier.includes("@")
    ? parsed.data.identifier
    : nimToSyntheticEmail(parsed.data.identifier);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email/NIM atau password salah." };
  }

  const redirectTo = formData.get("redirectTo");
  const target =
    typeof redirectTo === "string" && isSafeRedirect(redirectTo)
      ? redirectTo
      : "/dashboard";

  redirect(target);
}
