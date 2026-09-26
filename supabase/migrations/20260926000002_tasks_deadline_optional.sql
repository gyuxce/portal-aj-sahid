-- Deadline tugas kadang belum ditentukan dosen — memaksa admin isi tanggal
-- pasti malah bikin asal isi dan membingungkan mahasiswa. Keputusan produk
-- 2026-09-26: deadline opsional, ditampilkan kalau memang diisi.
alter table public.tasks alter column deadline drop not null;
