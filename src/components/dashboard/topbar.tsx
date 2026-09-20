import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { UserMenu } from "@/components/dashboard/user-menu";

export function Topbar({
  fullName,
  role,
  isAdminArea,
}: {
  fullName: string;
  role: "admin" | "student";
  isAdminArea: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            href={isAdminArea ? "/admin" : "/dashboard"}
            className="flex items-center gap-2"
          >
            <span className="brand-gradient flex size-7 items-center justify-center rounded-xl text-white shadow-sm shadow-primary/30">
              <GraduationCap className="size-4" strokeWidth={2.25} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Portal Kelas
            </span>
          </Link>
          {isAdminArea ? (
            <Badge variant="secondary" className="rounded-full">
              Admin
            </Badge>
          ) : null}
        </div>

        <UserMenu fullName={fullName} role={role} isAdminArea={isAdminArea} />
      </div>
    </header>
  );
}
