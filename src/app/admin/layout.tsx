import { Sidebar } from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import { SectionNav } from "@/components/dashboard/section-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { adminNavItems } from "@/components/dashboard/nav-items";
import { requireAdminProfile } from "@/lib/dal";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { UserRole } from "@/lib/types/database";

const PREVIEW_PROFILE: { full_name: string; role: UserRole } = {
  full_name: "Admin Pratinjau",
  role: "admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = isSupabaseConfigured();
  let profile: { full_name: string; role: UserRole } = PREVIEW_PROFILE;

  if (configured) {
    profile = await requireAdminProfile();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={adminNavItems}
        homeHref="/admin"
        fullName={profile.full_name}
        role="admin"
        isAdminArea
      />

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile-only header + pill nav; desktop uses Sidebar instead. */}
        <div className="md:hidden">
          <Topbar
            fullName={profile.full_name}
            role={profile.role}
            isAdminArea
          />
          <SectionNav items={adminNavItems} />
        </div>

        {!configured ? (
          <div className="px-4 pt-4 sm:px-6 md:px-8">
            <Badge
              variant="outline"
              className="rounded-full border-dashed text-xs font-normal text-muted-foreground"
            >
              Mode pratinjau — Supabase belum dikonfigurasi, aksi admin
              dinonaktifkan
            </Badge>
          </div>
        ) : null}

        <main className="flex-1 px-4 pb-16 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
