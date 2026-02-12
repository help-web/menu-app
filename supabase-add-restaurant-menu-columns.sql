-- Supabase 대시보드 → SQL Editor → New Query → 붙여넣기 후 Run
-- restaurants 테이블에 일품/정식/식사 메뉴 컬럼이 없을 때만 추가

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'restaurants' and column_name = 'ilpum_menus') then
    alter table public.restaurants add column ilpum_menus jsonb default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'restaurants' and column_name = 'set_menus') then
    alter table public.restaurants add column set_menus jsonb default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'restaurants' and column_name = 'meal_options') then
    alter table public.restaurants add column meal_options jsonb default '[]';
  end if;
end $$;
