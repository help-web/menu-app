-- Supabase SQL Editor에서 New Query 후 이 스크립트 실행 (Run 클릭)

create extension if not exists "uuid-ossp";

-- 앱에서 사용하는 전체 필드 반영
create table if not exists restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text,
  menu_image text,
  map_image text,
  items jsonb default '[]',
  created_at timestamptz default now()
);

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
