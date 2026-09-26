-- Materi bisa disertai foto (mis. screenshot bukti hadir Zoom) di pertemuan
-- yang sama, bukan cuma dokumen/link — keputusan produk 2026-09-26.

alter table public.materials drop constraint materials_material_type_check;
alter table public.materials add constraint materials_material_type_check
  check (material_type in ('pdf', 'ppt', 'doc', 'xls', 'zip', 'photo', 'link', 'other'));

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic'
]
where id = 'class-materials';
