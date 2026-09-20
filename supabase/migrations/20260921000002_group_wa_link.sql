-- Kelompok berkomunikasi lewat WhatsApp; simpan link grup WA per kelompok
-- supaya bisa ditampilkan langsung di halaman Tugas & Kelompok mahasiswa.
alter table public.groups add column wa_group_link text;
