"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { UserMenu } from "@/components/dashboard/user-menu";
import type { NavItem } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar({
  items,
  homeHref,
  fullName,
  role,
  isAdminArea,
}: {
  items: NavItem[];
  homeHref: string;
  fullName: string;
  role: "admin" | "student";
  isAdminArea: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background md:flex">
      <Link href={homeHref} className="flex items-center gap-2 px-5 py-5">
        <span className="brand-gradient flex size-8 items-center justify-center rounded-xl text-white shadow-sm shadow-primary/30">
          <GraduationCap className="size-4.5" strokeWidth={2.25} />
        </span>
        <span className="text-base font-semibold tracking-tight">
          Portal Kelas
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive =
            item.href === homeHref
              ? pathname === item.href
              : pathname.startsWith(item.href);

          if (!item.available) {
            return (
              <span
                key={item.href}
                aria-disabled
                className="flex cursor-not-allowed items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/50"
              >
                {item.icon}
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <UserMenu
          fullName={fullName}
          role={role}
          isAdminArea={isAdminArea}
          fullWidth
        />
      </div>
    </aside>
  );
}
