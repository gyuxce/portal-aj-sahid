-- Local development seed data. Applied by `supabase db reset`.
-- Fictional names/emails only — never real student data (SECURITY-RULES §1.9).
--
-- NOT verified against a running Supabase instance in this environment
-- (no Docker available here). Run `supabase db reset` yourself and adjust
-- the auth.users/auth.identities insert below if your local GoTrue version
-- rejects the column list.

-- ---------------------------------------------------------------------------
-- Dummy auth users (1 admin, 2 students) — triggers handle_new_user()
-- automatically, which creates the matching public.profiles rows.
-- Password for all seed accounts: "ChangeMe123!"
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'admin@kelas-alih-jenjang.test',
    crypt('ChangeMe123!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Contoh","role":"admin"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated', 'mahasiswa1@kelas-alih-jenjang.test',
    crypt('ChangeMe123!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mahasiswa Contoh Satu","role":"student"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated', 'mahasiswa2@kelas-alih-jenjang.test',
    crypt('ChangeMe123!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mahasiswa Contoh Dua","role":"student"}',
    now(), now(), '', '', '', ''
  );

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@kelas-alih-jenjang.test"}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"mahasiswa1@kelas-alih-jenjang.test"}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '{"sub":"33333333-3333-3333-3333-333333333333","email":"mahasiswa2@kelas-alih-jenjang.test"}',
    'email', now(), now(), now()
  );

-- nim/nickname are not covered by the trigger; fill them in for the seed rows.
update public.profiles set nim = '2026010001', nickname = 'Admin'
  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set nim = '2026010002', nickname = 'Mhs1'
  where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set nim = '2026010003', nickname = 'Mhs2'
  where id = '33333333-3333-3333-3333-333333333333';

-- ---------------------------------------------------------------------------
-- courses / schedules / course_links
-- ---------------------------------------------------------------------------
insert into public.courses (id, code, name, lecturer, status) values
  ('a0000000-0000-0000-0000-000000000001', 'MK-101', 'Pemrograman Web Lanjut', 'Dr. Contoh Dosen', 'active'),
  ('a0000000-0000-0000-0000-000000000002', 'MK-102', 'Basis Data Terapan', 'Dr. Contoh Dosen Dua', 'active');

insert into public.schedules (course_id, day_of_week, start_time, end_time, note, is_active) values
  ('a0000000-0000-0000-0000-000000000001', 'friday', '19:00', '21:00', 'Zoom malam Jumat', true),
  ('a0000000-0000-0000-0000-000000000002', 'saturday', '08:00', '10:00', 'Ruang B1', true);

insert into public.course_links (course_id, url, label, is_active, created_by) values
  ('a0000000-0000-0000-0000-000000000001', 'https://zoom.example.test/mk-101', 'Zoom Jumat malam', true, '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000002', 'https://meet.example.test/mk-102', 'Google Meet Sabtu pagi', true, '11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------
-- tasks / groups / group_members / group_task_updates
-- ---------------------------------------------------------------------------
insert into public.tasks (id, task_code, course_id, title, task_type, description, deadline, status, created_by) values
  ('b0000000-0000-0000-0000-000000000001', 'TASK-001', 'a0000000-0000-0000-0000-000000000001', 'Tugas Individu 1: Setup Proyek', 'individual', 'Buat repo dan deploy hello world.', now() + interval '5 days', 'active', '11111111-1111-1111-1111-111111111111'),
  ('b0000000-0000-0000-0000-000000000002', 'TASK-002', 'a0000000-0000-0000-0000-000000000002', 'Tugas Kelompok 1: ERD', 'group', 'Rancang ERD untuk studi kasus.', now() + interval '10 days', 'active', '11111111-1111-1111-1111-111111111111');

insert into public.groups (id, course_id, name, leader_id) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Kelompok 1', '22222222-2222-2222-2222-222222222222');

insert into public.group_members (group_id, profile_id) values
  ('c0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('c0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333');

insert into public.group_task_updates (group_id, task_id, progress_status, notes, updated_by) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'in_progress', 'ERD draft sudah dibuat.', '11111111-1111-1111-1111-111111111111');

-- ---------------------------------------------------------------------------
-- materials / announcements
-- ---------------------------------------------------------------------------
insert into public.materials (course_id, title, material_type, external_url, status, created_by) values
  ('a0000000-0000-0000-0000-000000000001', 'Slide Pertemuan 1', 'link', 'https://drive.example.test/slide-1', 'active', '11111111-1111-1111-1111-111111111111');

insert into public.announcements (course_id, title, body, is_pinned, status, created_by) values
  (null, 'Selamat datang di Portal Kelas', 'Portal ini memuat jadwal, tugas, dan pengumuman kelas alih jenjang.', true, 'published', '11111111-1111-1111-1111-111111111111'),
  ('a0000000-0000-0000-0000-000000000001', 'Perubahan jadwal pertemuan 3', 'Pertemuan pindah ke pukul 19.30.', false, 'published', '11111111-1111-1111-1111-111111111111');
