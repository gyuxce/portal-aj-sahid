-- Portal Kelas Alih Jenjang — baseline schema
-- Source: DATA-MODEL.md v1.0 (19 September 2026)
--
-- Assumptions made beyond the doc (call out if wrong):
--   - schedules gains created_at/updated_at per principle "tabel yang bisa
--     berubah punya updated_at", even though the table listing omitted them.
--   - group_task_updates.progress_status uses ('not_started','in_progress','done')
--     since the doc only says "Status progres kelompok" without an enum.
--   - materials.material_type and import_batches.entity_type/source_type/status
--     use check-constrained text values inferred from the doc's examples.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'student');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.user_role not null default 'student',
  nim text unique,
  full_name text not null,
  nickname text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per auth.users, created automatically by handle_new_user().';

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  lecturer text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- schedules
-- ---------------------------------------------------------------------------
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  day_of_week text not null check (day_of_week in ('friday', 'saturday')),
  start_time time not null,
  end_time time not null,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedules_time_order check (end_time > start_time)
);

create index schedules_course_id_idx on public.schedules (course_id);

-- ---------------------------------------------------------------------------
-- course_links
-- ---------------------------------------------------------------------------
create table public.course_links (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  url text not null,
  label text,
  is_active boolean not null default true,
  archived_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index course_links_course_id_idx on public.course_links (course_id);

-- Enforce "satu mata kuliah hanya memiliki satu link kelas aktif".
create unique index course_links_one_active_per_course
  on public.course_links (course_id)
  where is_active;

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_code text not null unique,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  task_type text not null check (task_type in ('individual', 'group')),
  description text,
  deadline timestamptz not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_course_id_idx on public.tasks (course_id);
create index tasks_deadline_idx on public.tasks (deadline);

-- ---------------------------------------------------------------------------
-- groups
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  leader_id uuid references public.profiles (id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, name)
);

create index groups_course_id_idx on public.groups (course_id);

-- ---------------------------------------------------------------------------
-- group_members
-- ---------------------------------------------------------------------------
create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

create index group_members_profile_id_idx on public.group_members (profile_id);

-- ---------------------------------------------------------------------------
-- group_task_updates
-- ---------------------------------------------------------------------------
create table public.group_task_updates (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  progress_status text not null default 'not_started'
    check (progress_status in ('not_started', 'in_progress', 'done')),
  notes text,
  updated_by uuid not null references public.profiles (id),
  updated_at timestamptz not null default now(),
  unique (group_id, task_id)
);

create index group_task_updates_task_id_idx on public.group_task_updates (task_id);

-- ---------------------------------------------------------------------------
-- task_evidence
-- ---------------------------------------------------------------------------
create table public.task_evidence (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  group_id uuid references public.groups (id) on delete cascade,
  external_url text,
  storage_path text,
  file_name text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint task_evidence_has_source check (
    external_url is not null or storage_path is not null
  )
);

create index task_evidence_task_id_idx on public.task_evidence (task_id);

-- ---------------------------------------------------------------------------
-- materials
-- ---------------------------------------------------------------------------
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  title text not null,
  material_type text not null
    check (material_type in ('pdf', 'ppt', 'doc', 'xls', 'zip', 'link', 'other')),
  external_url text,
  storage_path text,
  file_name text,
  file_size bigint,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint materials_has_source check (
    external_url is not null or storage_path is not null
  )
);

create index materials_course_id_idx on public.materials (course_id);

-- ---------------------------------------------------------------------------
-- announcements
-- ---------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  status text not null default 'published' check (status in ('published', 'archived')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_course_id_idx on public.announcements (course_id);

-- ---------------------------------------------------------------------------
-- import_batches / import_errors
-- ---------------------------------------------------------------------------
create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file_name text not null,
  source_type text not null check (source_type in ('csv', 'xlsx')),
  entity_type text not null
    check (entity_type in ('profiles', 'courses', 'groups', 'tasks', 'materials')),
  status text not null default 'preview' check (status in ('preview', 'confirmed', 'failed')),
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  error_rows integer not null default 0,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.import_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete cascade,
  row_number integer not null,
  field_name text,
  message text not null,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

create index import_errors_batch_id_idx on public.import_errors (batch_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.courses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.schedules
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.groups
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.group_task_updates
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.materials
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
