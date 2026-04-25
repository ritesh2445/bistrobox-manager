-- Complete Database Initialization for BistroBox
-- Run in Supabase SQL Editor for new project

-- 1. Create base tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text not null,
  sort_order int not null default 0
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.waiter_requests (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  note text not null default '',
  items jsonb not null default '[]',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- 2. Add updated columns for multi-tenant setup (if they don't exist in a fresh DB they will just be added)
alter table public.categories      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.menu_items      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.waiter_requests add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.waiter_requests add column if not exists guest_name text not null default '';

-- 3. Enable RLS
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.analytics enable row level security;
alter table public.waiter_requests enable row level security;

-- 4. Create trigger for updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql
security invoker
set search_path = public;

drop trigger if exists set_updated_at on public.menu_items;
create trigger set_updated_at
  before update on public.menu_items
  for each row
  execute function public.update_updated_at();

-- 5. Create storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Anyone can read menu images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu-images');

create policy "Authenticated can upload menu images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

create policy "Authenticated can update menu images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images');

create policy "Authenticated can delete menu images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images');

-- 6. Setup policies for multi-tenant structure
-- Categories
create policy "Anyone can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Owner can insert categories"
  on public.categories for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Owner can update categories"
  on public.categories for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Owner can delete categories"
  on public.categories for delete
  to authenticated
  using (user_id = auth.uid());

-- Menu Items
create policy "Anyone can read available menu items"
  on public.menu_items for select
  to anon, authenticated
  using (true);

create policy "Owner can insert menu items"
  on public.menu_items for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Owner can update menu items"
  on public.menu_items for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Owner can delete menu items"
  on public.menu_items for delete
  to authenticated
  using (user_id = auth.uid());

-- Waiter Requests
create policy "Anyone can insert waiter requests"
  on public.waiter_requests for insert
  to anon, authenticated
  with check (true);

create policy "Owner can read waiter requests"
  on public.waiter_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "Owner can update waiter requests"
  on public.waiter_requests for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Owner can delete waiter requests"
  on public.waiter_requests for delete
  to authenticated
  using (user_id = auth.uid());

-- Analytics
create policy "Anyone can insert analytics"
  on public.analytics for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read analytics"
  on public.analytics for select
  to authenticated
  using (true);

-- 7. Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.menu_items;
alter publication supabase_realtime add table public.waiter_requests;

-- 8. Create Admin User & Seed Data
-- Note: Re-creating auth.users entries directly via SQL can have side-effects without the complete trigger workflow in Supabase.
-- It is strongly recommended to sign up the initial user via the UI/App, and then manually run an update script 
-- to attach user_id. However, to seed here for demonstration:

-- insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
-- values (
--   'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
--   '00000000-0000-0000-0000-000000000000',
--   'authenticated',
--   'authenticated',
--   'adminatbistro@gmail.com',
--   crypt('Bistro123', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"provider":"email","providers":["email"]}',
--   '{}',
--   now(),
--   now(),
--   '',
--   '',
--   '',
--   ''
-- ) on conflict (id) do nothing;
-- 
-- insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
-- values (
--   'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
--   'cf52f5a5-569c-459a-af3d-2dbc1585a5c9',
--   format('{"sub":"%s","email":"%s"}', 'cf52f5a5-569c-459a-af3d-2dbc1585a5c9', 'adminatbistro@gmail.com')::jsonb,
--   'email',
--   now(),
--   now(),
--   now()
-- ) on conflict (id) do nothing;
