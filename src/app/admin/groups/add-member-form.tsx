"use client";

import { useActionState, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { saveGroupMembers, type ActionState } from "@/lib/actions/groups";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddMemberForm({
  groupId,
  availableStudents,
  currentMembers,
  currentLeaderId,
}: {
  groupId: string;
  availableStudents: { id: string; full_name: string }[];
  currentMembers: { id: string; full_name: string }[];
  currentLeaderId: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveGroupMembers,
    null,
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [leaderId, setLeaderId] = useState(currentLeaderId ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableStudents;
    return availableStudents.filter((s) =>
      s.full_name.toLowerCase().includes(q),
    );
  }, [availableStudents, query]);

  // Leader can be picked from members already in the group, or from
  // students just checked below — both are saved together in one submit.
  const leaderCandidates = useMemo(() => {
    const staged = availableStudents.filter((s) => selected.has(s.id));
    return [...currentMembers, ...staged];
  }, [currentMembers, availableStudents, selected]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-3"
    >
      <input type="hidden" name="group_id" value={groupId} />
      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {availableStudents.length > 0 ? (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama untuk ditambah..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg bg-muted/40 p-1.5">
            {filtered.length === 0 ? (
              <p className="px-1.5 py-2 text-sm text-muted-foreground">
                Tidak ada mahasiswa yang cocok.
              </p>
            ) : (
              filtered.map((student) => (
                <label
                  key={student.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-background"
                >
                  <input
                    type="checkbox"
                    name="profile_ids"
                    value={student.id}
                    checked={selected.has(student.id)}
                    onChange={() => toggle(student.id)}
                    className="size-4 rounded border-input"
                  />
                  {student.full_name}
                </label>
              ))
            )}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Semua mahasiswa sudah ada di kelompok ini.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`leader-${groupId}`} className="text-xs">
          Ketua kelompok
        </Label>
        <select
          id={`leader-${groupId}`}
          name="leader_id"
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Tidak ada</option>
          {leaderCandidates.map((student) => (
            <option key={student.id} value={student.id}>
              {student.full_name}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={pending}
        className="w-fit"
      >
        {pending
          ? "Menyimpan..."
          : selected.size > 0
            ? `Simpan (tambah ${selected.size} anggota)`
            : "Simpan"}
      </Button>
    </form>
  );
}
