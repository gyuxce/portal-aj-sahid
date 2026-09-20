"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Students already placed in any group of this course are rendered disabled
 * instead of hidden, so the admin can see where everyone went and cannot
 * assign the same student to two groups. */
export function StudentPicker({
  students,
  takenIds,
  selected,
  onToggle,
}: {
  students: { id: string; full_name: string }[];
  takenIds: Set<string>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name.toLowerCase().includes(q));
  }, [students, query]);

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada mahasiswa terdaftar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama mahasiswa..."
          className="h-9 pl-8"
        />
      </div>

      <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto rounded-xl bg-muted/40 p-1.5">
        {filtered.length === 0 ? (
          <p className="px-1.5 py-2 text-sm text-muted-foreground">
            Tidak ada mahasiswa yang cocok.
          </p>
        ) : (
          filtered.map((student) => {
            const taken = takenIds.has(student.id);
            return (
              <label
                key={student.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-sm",
                  taken
                    ? "cursor-not-allowed text-muted-foreground/50"
                    : "cursor-pointer hover:bg-background",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(student.id)}
                  disabled={taken}
                  onChange={() => onToggle(student.id)}
                  className="size-4 rounded border-input"
                />
                <span className="flex-1 truncate">{student.full_name}</span>
                {taken ? (
                  <span className="shrink-0 text-xs">sudah berkelompok</span>
                ) : null}
              </label>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {selected.size} mahasiswa dipilih
      </p>
    </div>
  );
}
