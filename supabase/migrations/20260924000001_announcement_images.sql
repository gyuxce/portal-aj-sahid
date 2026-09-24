-- Foto/banner opsional untuk pengumuman, ditampilkan sebagai carousel di
-- Beranda. Bucket publik (bukan private+signed URL) karena gambar ini
-- memang dimaksudkan terlihat luas seperti banner, bukan data sensitif —
-- keputusan pengguna 2026-09-24.

alter table public.announcements
  add column image_path text;

comment on column public.announcements.image_path is
  'Storage object path in the public "announcement-images" bucket; null when the announcement has no image.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'announcement-images',
  'announcement-images',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: anyone (no session required) can read the images, since
-- they're meant to be seen like a banner. Only admins can write.
create policy "announcement_images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'announcement-images');

create policy "announcement_images_admin_manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'announcement-images' and public.is_admin())
  with check (bucket_id = 'announcement-images' and public.is_admin());
