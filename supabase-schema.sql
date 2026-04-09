-- ============================================================
-- çç²æå¸ / KÅhÄ« TechÅ  Supabase schema
-- Run this in Supabase Dashboard â SQL Editor
-- ============================================================

-- --- PROFILES ----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'åå¡äºº',
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public read profiles" on public.profiles
  for select using (true);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- --- SHOPS -------------------------------------------------------
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  hours text,
  phone text,
  has_wifi boolean default false,
  has_power boolean default false,
  time_limit_minutes int,          -- null = no limit
  pet_friendly boolean default false,
  reservation_only boolean default false,
  cover_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists shops_latlng_idx on public.shops (lat, lng);

alter table public.shops enable row level security;

create policy "Public read shops" on public.shops
  for select using (true);

create policy "Authed users insert shops" on public.shops
  for insert with check (auth.uid() = created_by);

create policy "Creators update own shops" on public.shops
  for update using (auth.uid() = created_by);


-- --- BEAN REVIEWS (è±è©) -----------------------------------------
create table if not exists public.bean_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  origin text,             -- ç¢å° e.g. è¡£ç´¢æ¯äº è¶å éªè²
  roaster text,            -- çè±å
  roast_level text,        -- æ·ºç / ä¸­ç / æ·±ç
  brew_method text,        -- ææ² / ç¾©å¼ / å°æ»´ / è¹å¸...
  shop_id uuid references public.shops(id) on delete set null,
  photo_url text,          -- single photo only
  score_aroma numeric(2,1) not null check (score_aroma between 0 and 5),
  score_acidity numeric(2,1) not null check (score_acidity between 0 and 5),
  score_sweetness numeric(2,1) not null check (score_sweetness between 0 and 5),
  score_bitterness numeric(2,1) not null check (score_bitterness between 0 and 5),
  score_body numeric(2,1) not null check (score_body between 0 and 5),
  score_aftertaste numeric(2,1) not null check (score_aftertaste between 0 and 5),
  first_impression text,   -- ç¬¬ä¸å£çå°è±¡
  flavor_notes text,       -- è¯æ³å°çé¢¨å³
  recommendation text,     -- æ¨è¦çµ¦æåçè©±
  created_at timestamptz default now()
);

create index if not exists bean_reviews_user_idx on public.bean_reviews (user_id, created_at desc);
create index if not exists bean_reviews_shop_idx on public.bean_reviews (shop_id);

alter table public.bean_reviews enable row level security;

create policy "Public read bean_reviews" on public.bean_reviews
  for select using (true);

create policy "Users insert own bean_reviews" on public.bean_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users update own bean_reviews" on public.bean_reviews
  for update using (auth.uid() = user_id);

create policy "Users delete own bean_reviews" on public.bean_reviews
  for delete using (auth.uid() = user_id);


-- --- SHOP REVIEWS (åºè©) -----------------------------------------
create table if not exists public.shop_reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score_flavor numeric(2,1) not null check (score_flavor between 0 and 5),
  score_vibe numeric(2,1) not null check (score_vibe between 0 and 5),
  score_stay numeric(2,1) not null check (score_stay between 0 and 5),
  score_work numeric(2,1) not null check (score_work between 0 and 5),
  score_dessert numeric(2,1) not null check (score_dessert between 0 and 5),
  score_value numeric(2,1) not null check (score_value between 0 and 5),
  comment text,
  photo_url text,          -- single photo only
  created_at timestamptz default now(),
  unique (shop_id, user_id)  -- ä¸äººä¸åºä¸å
);

create index if not exists shop_reviews_shop_idx on public.shop_reviews (shop_id, created_at desc);

alter table public.shop_reviews enable row level security;

create policy "Public read shop_reviews" on public.shop_reviews
  for select using (true);

create policy "Users insert own shop_reviews" on public.shop_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users update own shop_reviews" on public.shop_reviews
  for update using (auth.uid() = user_id);

create policy "Users delete own shop_reviews" on public.shop_reviews
  for delete using (auth.uid() = user_id);


-- --- COMMENTS ----------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('bean_review','shop_review')),
  target_id uuid not null,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists comments_target_idx on public.comments (target_type, target_id, created_at desc);

alter table public.comments enable row level security;

create policy "Public read comments" on public.comments
  for select using (true);

create policy "Users insert own comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users delete own comments" on public.comments
  for delete using (auth.uid() = user_id);


-- --- STORAGE bucket (photos) -------------------------------------
-- Run in Dashboard â Storage â Create bucket named "photos" (public)
-- Then add this policy in SQL Editor:
--
-- create policy "Public read photos"
--   on storage.objects for select
--   using (bucket_id = 'photos');
--
-- create policy "Authed users upload photos"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'photos');
--
-- create policy "Users delete own photos"
--   on storage.objects for delete to authenticated
--   using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
