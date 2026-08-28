create table if not exists public.photo_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_id bigint not null references public.mission_photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);

create or replace function public.enforce_photo_like_limit() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.photo_likes where user_id=new.user_id) >= 20 then
    raise exception '사용할 수 있는 하트 20개를 모두 사용했습니다.';
  end if;
  return new;
end; $$;

drop trigger if exists photo_like_limit on public.photo_likes;
create trigger photo_like_limit before insert on public.photo_likes
for each row execute function public.enforce_photo_like_limit();

alter table public.photo_likes enable row level security;

drop policy if exists photo_likes_read on public.photo_likes;
create policy photo_likes_read on public.photo_likes for select to authenticated
using(public.is_admin() or (select gallery_open from public.app_settings where id=1));

drop policy if exists photo_likes_insert on public.photo_likes;
create policy photo_likes_insert on public.photo_likes for insert to authenticated
with check(user_id=auth.uid() and (select gallery_open from public.app_settings where id=1));

drop policy if exists photo_likes_delete on public.photo_likes;
create policy photo_likes_delete on public.photo_likes for delete to authenticated
using(user_id=auth.uid());

grant select, insert, delete on public.photo_likes to authenticated;

select 'photo_likes ready' as status;
