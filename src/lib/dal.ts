import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

/**
 * Data Access Layer: every server-rendered page/action that needs the
 * current user should go through here instead of calling supabase.auth
 * directly, so the auth + profile check is never accidentally skipped.
 * Wrapped in React's cache() so a layout + page calling this in the same
 * request only hits Supabase once.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
});

/** Redirects to /login when there is no session. Use in protected layouts. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Redirects to /login when there is no session, and to /dashboard when the
 * session exists but the profile role is not admin. RLS enforces the same
 * boundary at the data layer — this is only for routing/UX.
 */
export async function requireAdminProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return profile;
}
