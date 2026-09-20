-- Jadwal presentasi tiap kelompok bisa beda meski tugasnya sama (satu
-- deadline resmi di public.tasks, tapi sesi presentasi digilir per
-- kelompok). Kolom ini opsional dan diisi manual oleh admin per kelompok.
alter table public.groups add column presentation_at timestamptz;
