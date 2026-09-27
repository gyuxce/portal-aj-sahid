"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useNavBadge } from "@/hooks/use-nav-badge";
import type { NavItem } from "@/components/dashboard/nav-items";

function NavPill({
  item,
  isActive,
  latestIso,
}: {
  item: NavItem;
  isActive: boolean;
  latestIso: string | null | undefined;
}) {
  const hasNew = useNavBadge(item.href, latestIso, isActive);

  if (!item.available) {
    return (
      <span
        aria-disabled
        className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm text-muted-foreground/50"
      >
        {item.icon}
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <span className="relative flex items-center">
        {item.icon}
        {hasNew ? (
          <span className="absolute -right-1 -top-1 size-1.5 rounded-full bg-destructive" />
        ) : null}
      </span>
      {item.label}
    </Link>
  );
}

export function SectionNav({
  items,
  badgeTimestamps,
}: {
  items: NavItem[];
  badgeTimestamps?: Record<string, string | null>;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bagian"
      className="scrollbar-none flex gap-2 overflow-x-auto px-4 pt-3 pb-4 sm:px-6"
    >
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard" || item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <NavPill
            key={item.href}
            item={item}
            isActive={isActive}
            latestIso={badgeTimestamps?.[item.href]}
          />
        );
      })}
    </nav>
  );
}
