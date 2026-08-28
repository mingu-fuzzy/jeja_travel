create or replace function public.reset_mission_receipts() returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  target_profile record;
begin
  if not public.is_admin() then
    raise exception '관리자만 미션 수령 상태를 초기화할 수 있습니다.';
  end if;

  for target_profile in
    select id from public.profiles where missions_received is distinct from false
  loop
    update public.profiles
    set missions_received = false
    where id = target_profile.id;
  end loop;
end;
$$;

revoke all on function public.reset_mission_receipts() from public, anon;
grant execute on function public.reset_mission_receipts() to authenticated;

notify pgrst, 'reload schema';

select 'reset_mission_receipts ready' as status;
