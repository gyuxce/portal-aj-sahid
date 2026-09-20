// Students log in with their NIM instead of a real email (see AGENTS
// conversation: no real student emails available). Under the hood we still
// need a valid-looking email for Supabase Auth, so we synthesize one from
// the NIM using this fixed, non-deliverable domain.
export const STUDENT_EMAIL_DOMAIN = "mhs.portal-kelas.local";

export function nimToSyntheticEmail(nim: string) {
  return `${nim.trim()}@${STUDENT_EMAIL_DOMAIN}`;
}
