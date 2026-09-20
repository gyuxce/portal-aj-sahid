-- Supabase Storage untuk materi kuliah (upload file asli, bukan cuma link).
-- Bucket private secara default (SECURITY-RULES.md §4). Batas ukuran 50MB
-- per file adalah keputusan produk (bukan batas platform), lihat
-- SECURITY-RULES.md §4 dan diskusi dengan pengguna 2026-09-21.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-materials',
  'class-materials',
  false,
  52428800, -- 50 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Mahasiswa cuma bisa baca objek yang punya baris materials aktif yang
-- menunjuk ke path itu (mirror aturan tabel materials). File yang baru
-- diupload tapi belum "diresmikan" jadi baris materials tidak bisa dibaca
-- siapa pun selain admin — mencegah "tebak URL" (SECURITY-RULES.md §7).
create policy "class_materials_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'class-materials'
    and (
      public.is_admin()
      or exists (
        select 1 from public.materials m
        where m.storage_path = storage.objects.name and m.status = 'active'
      )
    )
  );

create policy "class_materials_admin_manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'class-materials' and public.is_admin())
  with check (bucket_id = 'class-materials' and public.is_admin());
