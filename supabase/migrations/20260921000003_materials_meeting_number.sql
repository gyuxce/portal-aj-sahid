-- Materi dikelompokkan per mata kuliah + pertemuan supaya rapi dan
-- tercatat mengikuti jadwal kuliah (14-16 pertemuan per semester).
alter table public.materials add column meeting_number integer;
