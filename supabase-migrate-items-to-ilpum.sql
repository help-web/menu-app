-- 기존 items 데이터를 ilpum_menus로 복사 (한 번만 실행)
-- Supabase SQL Editor에서 New Query 후 Run

UPDATE restaurants
SET ilpum_menus = items
WHERE COALESCE(jsonb_array_length(ilpum_menus), 0) = 0
  AND items IS NOT NULL
  AND jsonb_array_length(items) > 0;
