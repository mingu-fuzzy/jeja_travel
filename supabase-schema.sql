create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text unique not null check (name in ('서성준','최민규','한은혜','이다경','김학진','은태경','이은비')),
  role text not null default 'member' check (role in ('member','admin')),
  missions_received boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.app_settings (
  id smallint primary key default 1 check (id = 1), missions_open boolean not null default false,
  quiz_open boolean not null default false, quiz_results_open boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;
create table if not exists public.mission_photos (
  id bigint generated always as identity primary key, user_id uuid not null references public.profiles(id) on delete cascade,
  mission_index smallint not null check (mission_index between 0 and 4), storage_path text not null,
  completed_at timestamptz not null default now(), unique (user_id, mission_index)
);
create table if not exists public.quiz_results (
  id bigint generated always as identity primary key, user_id uuid unique not null references public.profiles(id) on delete cascade,
  answers jsonb not null, score smallint not null, total smallint not null, submitted_at timestamptz not null default now()
);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
declare requested_name text;
begin
  requested_name := new.raw_user_meta_data ->> 'display_name';
  if requested_name not in ('서성준','최민규','한은혜','이다경','김학진','은태경','이은비') then raise exception '허용되지 않은 이름'; end if;
  insert into public.profiles(id,name,role) values(new.id,requested_name,case when requested_name='최민규' then 'admin' else 'member' end);
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;
create or replace function public.group_progress() returns table(name text,completed_count bigint)
language sql stable security definer set search_path=public as $$
  select p.name,count(mp.id) from public.profiles p left join public.mission_photos mp on mp.user_id=p.id
  where auth.uid() is not null group by p.name; $$;
create or replace function public.account_exists(target_name text) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where name=target_name); $$;
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.mission_photos enable row level security;
alter table public.quiz_results enable row level security;
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke update on public.profiles from authenticated;
grant update (missions_received) on public.profiles to authenticated;
drop policy if exists settings_read on public.app_settings;
create policy settings_read on public.app_settings for select to authenticated using(true);
drop policy if exists settings_admin_update on public.app_settings;
create policy settings_admin_update on public.app_settings for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists photos_read on public.mission_photos;
create policy photos_read on public.mission_photos for select to authenticated using(user_id=auth.uid() or public.is_admin());
drop policy if exists photos_insert on public.mission_photos;
create policy photos_insert on public.mission_photos for insert to authenticated with check(user_id=auth.uid());
drop policy if exists photos_update on public.mission_photos;
create policy photos_update on public.mission_photos for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists photos_delete on public.mission_photos;
create policy photos_delete on public.mission_photos for delete to authenticated using(user_id=auth.uid());
drop policy if exists quiz_insert_own on public.quiz_results;
create policy quiz_insert_own on public.quiz_results for insert to authenticated with check(user_id=auth.uid());
drop policy if exists quiz_read on public.quiz_results;
create policy quiz_read on public.quiz_results for select to authenticated using(user_id=auth.uid() or (select quiz_results_open from public.app_settings where id=1));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('mission-photos','mission-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists storage_photo_insert on storage.objects;
create policy storage_photo_insert on storage.objects for insert to authenticated with check(bucket_id='mission-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists storage_photo_update on storage.objects;
create policy storage_photo_update on storage.objects for update to authenticated using(bucket_id='mission-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists storage_photo_read on storage.objects;
create policy storage_photo_read on storage.objects for select to authenticated using(bucket_id='mission-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
drop policy if exists storage_photo_delete on storage.objects;
create policy storage_photo_delete on storage.objects for delete to authenticated using(bucket_id='mission-photos' and (storage.foldername(name))[1]=auth.uid()::text);
grant execute on function public.group_progress() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.account_exists(text) to anon, authenticated;
do $$ begin alter publication supabase_realtime add table public.app_settings; exception when duplicate_object then null; end $$;
