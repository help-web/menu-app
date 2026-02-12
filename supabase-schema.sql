-- Supabase SQL Editor에서 New Query 후 이 스크립트 실행 (Run 클릭)
-- 메뉴 구조: 일품 / 정식(세트) / 식사 메뉴 분리

create extension if not exists "uuid-ossp";

-- 식당: 기존 items 유지(하위 호환), 신규 컬럼 추가
create table if not exists restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text,
  menu_image text,
  map_image text,
  items jsonb default '[]',
  ilpum_menus jsonb default '[]',
  set_menus jsonb default '[]',
  meal_options jsonb default '[]',
  created_at timestamptz default now()
);

-- 기존 테이블에 컬럼이 없으면 추가 (이미 있으면 무시)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'restaurants' and column_name = 'ilpum_menus') then
    alter table restaurants add column ilpum_menus jsonb default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'restaurants' and column_name = 'set_menus') then
    alter table restaurants add column set_menus jsonb default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'restaurants' and column_name = 'meal_options') then
    alter table restaurants add column meal_options jsonb default '[]';
  end if;
end $$;

-- 주문 구조: menu_type, ilpum_orders(방별 일품), set_type/set_quantity/meal_selections(정식)
-- events.orders jsonb 내 각 order 객체 형식:
-- { id, groupId?, restaurantName, paymentMethod, note, timestamp, isReorder?, needsAdminCheck?,
--   menuType: "ilpum"|"set",
--   rooms?: [{ id, roomName, items: { [메뉴명]: 수량 }, totalPrice }],  // 일품일 때
--   setType?: string, setQuantity?: number, mealSelections?: [{ name, quantity }], setPrice?: number, mealTotal?: number  // 정식일 때
-- }
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  org_name text,
  manager text,
  contact text,
  date text,
  status text default 'res_pending',
  res_data jsonb,
  assigned_restaurant_id text,
  assigned_groups jsonb,
  orders jsonb default '[]',
  latest_order jsonb,
  unread_res boolean default false,
  unread_order boolean default false,
  created_at timestamptz default now()
);
