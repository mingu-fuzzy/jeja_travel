alter table public.app_settings
  add column if not exists gallery_open boolean not null default false;

update public.profiles
set role = 'admin'
where name = '최민규';

drop policy if exists settings_admin_update on public.app_settings;
create policy settings_admin_update
on public.app_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists photos_read on public.mission_photos;
create policy photos_read
on public.mission_photos
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or (select gallery_open from public.app_settings where id = 1)
);

drop policy if exists storage_photo_read on storage.objects;
create policy storage_photo_read
on storage.objects
for select
to authenticated
using (
  bucket_id = 'mission-photos'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or (select gallery_open from public.app_settings where id = 1)
  )
);

select id, missions_open, gallery_open, quiz_open, quiz_results_open
from public.app_settings;

select name, role
from public.profiles
where name = '최민규';
