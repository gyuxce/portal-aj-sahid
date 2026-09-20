import Link from "next/link";

import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({
  fullName,
  role,
  isAdminArea,
  fullWidth = false,
}: {
  fullName: string;
  role: "admin" | "student";
  isAdminArea: boolean;
  /** Sidebar usage: trigger fills the rail width instead of hugging content. */
  fullWidth?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex items-center gap-2 rounded-full p-1 pr-2 transition-colors hover:bg-muted",
              fullWidth && "w-full rounded-xl pr-3",
            )}
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {initials(fullName) || "?"}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "hidden text-sm font-medium sm:inline",
            fullWidth && "inline flex-1 truncate text-left",
          )}
        >
          {fullName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={fullWidth ? "start" : "end"}
        className="w-56 rounded-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Admin" : "Mahasiswa"}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {role === "admin" ? (
          <DropdownMenuItem
            render={<Link href={isAdminArea ? "/dashboard" : "/admin"} />}
          >
            {isAdminArea ? "Ke tampilan mahasiswa" : "Buka panel admin"}
          </DropdownMenuItem>
        ) : null}
        <form action={signOut}>
          <DropdownMenuItem
            nativeButton
            render={<button type="submit" className="w-full text-left" />}
          >
            Keluar
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
