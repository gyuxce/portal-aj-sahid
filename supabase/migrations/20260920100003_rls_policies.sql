-- Row Level Security — Portal Kelas Alih Jenjang
-- Source: SECURITY-RULES.md v1.0, section 2 (access matrix) and section 3.
--
-- Pattern used throughout:
--   - RLS is enabled on every table below and policies target `authenticated`
--     only, so `anon` (no session) is denied by default — satisfies
--     "Pengguna tanpa session tidak dapat membaca data portal".
--   - is_admin() is SECURITY DEFINER so it can read profiles.role without
--     recursing through profiles' own RLS policy.
--   - Admin write access is granted with one "for all" policy per table;
--     combined with a separate read policy for students, Postgres OR's the
--     two permissive policies together for SELECT (admin sees everything,
--     students see only active/published rows), while INSERT/UPDATE/DELETE
--     only match the admin policy.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Lock down default privileges: anon gets nothing, authenticated gets the
-- baseline DML privilege that RLS policies then narrow per row/command.
revoke all on public.profiles from anon;
revoke all on public.courses from anon;
revoke all on public.schedules from anon;
revoke all on public.course_links from anon;
revoke all on public.tasks from anon;
revoke all on public.groups from anon;
revoke all on public.group_members from anon;
revoke all on public.group_task_updates from anon;
revoke all on public.task_evidence from anon;
revoke all on public.materials from anon;
revoke all on public.announcements from anon;
revoke all on public.import_batches from anon;
revoke all on public.import_errors from anon;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.courses to authenticated;
grant select, insert, update, delete on public.schedules to authenticated;
grant select, insert, update, delete on public.course_links to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.group_task_updates to authenticated;
grant select, insert, update, delete on public.task_evidence to authenticated;
grant select, insert, update, delete on public.materials to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.import_batches to authenticated;
grant select, insert, update, delete on public.import_errors to authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Every signed-in user can see the class roster (needed to show group member
-- names, task creators, etc.). Column-level masking of NIM/email is left to
-- the application layer — Postgres RLS is row-level only. Follow-up: add a
-- restricted view if NIM/email needs to be hidden from other students.
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (true);

create policy profiles_admin_manage on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
alter table public.courses enable row level security;

create policy courses_select_active on public.courses
  for select to authenticated
  using (status = 'active');

create policy courses_admin_manage on public.courses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- schedules
-- ---------------------------------------------------------------------------
alter table public.schedules enable row level security;

create policy schedules_select_active on public.schedules
  for select to authenticated
  using (is_active);

create policy schedules_admin_manage on public.schedules
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- course_links
-- ---------------------------------------------------------------------------
alter table public.course_links enable row level security;

create policy course_links_select_active on public.course_links
  for select to authenticated
  using (is_active);

create policy course_links_admin_manage on public.course_links
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
alter table public.tasks enable row level security;

create policy tasks_select_active on public.tasks
  for select to authenticated
  using (status = 'active');

create policy tasks_admin_manage on public.tasks
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
alter table public.groups enable row level security;

create policy groups_select_authenticated on public.groups
  for select to authenticated
  using (true);

create policy groups_admin_manage on public.groups
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- group_members
-- ---------------------------------------------------------------------------
alter table public.group_members enable row level security;

create policy group_members_select_authenticated on public.group_members
  for select to authenticated
  using (true);

create policy group_members_admin_manage on public.group_members
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- group_task_updates
-- ---------------------------------------------------------------------------
alter table public.group_task_updates enable row level security;

create policy group_task_updates_select_authenticated on public.group_task_updates
  for select to authenticated
  using (true);

-- Mahasiswa tidak dapat menulis progres pada MVP (SECURITY-RULES §2).
create policy group_task_updates_admin_manage on public.group_task_updates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- task_evidence
-- ---------------------------------------------------------------------------
alter table public.task_evidence enable row level security;

create policy task_evidence_select_for_active_task on public.task_evidence
  for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_evidence.task_id and t.status = 'active'
    )
  );

-- Mahasiswa tidak dapat menulis bukti sendiri pada MVP (SECURITY-RULES §2).
-- Jika fitur self-submission ditambahkan nanti, buat policy insert terpisah
-- yang membatasi created_by = auth.uid() dan group_id milik grup mahasiswa
-- tersebut — jangan buka update/delete umum.
create policy task_evidence_admin_manage on public.task_evidence
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- materials
-- ---------------------------------------------------------------------------
alter table public.materials enable row level security;

create policy materials_select_active on public.materials
  for select to authenticated
  using (status = 'active');

create policy materials_admin_manage on public.materials
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- announcements
-- ---------------------------------------------------------------------------
alter table public.announcements enable row level security;

create policy announcements_select_published on public.announcements
  for select to authenticated
  using (status = 'published');

create policy announcements_admin_manage on public.announcements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- import_batches / import_errors — admin only, no student access at all.
-- ---------------------------------------------------------------------------
alter table public.import_batches enable row level security;
alter table public.import_errors enable row level security;

create policy import_batches_admin_only on public.import_batches
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy import_errors_admin_only on public.import_errors
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
