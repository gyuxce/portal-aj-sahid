"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export type StudentListItem = {
  id: string;
  full_name: string;
  nim: string | null;
};

export function StudentSearchList({
  students,
  actions,
}: {
  students: StudentListItem[];
  /** Pre-rendered per-row action element, keyed by profile id (server-rendered Client Component instances — safe to pass as props). */
  actions?: Record<string, ReactNode>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        (s.nim ?? "").toLowerCase().includes(q),
    );
  }, [students, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama atau NIM..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Tidak ada mahasiswa yang cocok dengan pencarian.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(student.full_name) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{student.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    NIM: {student.nim ?? "-"}
                  </p>
                </div>
              </div>
              {actions?.[student.id]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
