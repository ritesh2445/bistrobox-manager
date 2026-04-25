-- ============================================================
-- Per-Account Menus Migration
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/qinrcfyrdzuncrbotnzc/sql
-- ============================================================

-- 1. Add columns
alter table public.categories      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.menu_items      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.waiter_requests add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.waiter_requests add column if not exists guest_name text not null default '';

-- 2. Assign existing seed data to the original admin user
update public.categories set user_id = 'cf52f5a5-569c-459a-af3d-2dbc1585a5c9' where user_id is null;
update public.menu_items  set user_id = 'cf52f5a5-569c-459a-af3d-2dbc1585a5c9' where user_id is null;

-- 3. Drop old permissive policies on categories
drop policy if exists "Public can read categories"          on public.categories;
drop policy if exists "Authenticated can insert categories" on public.categories;
drop policy if exists "Authenticated can update categories" on public.categories;
drop policy if exists "Authenticated can delete categories" on public.categories;

-- 4. New per-user policies for categories
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

-- 5. Drop old permissive policies on menu_items
drop policy if exists "Public can read available menu items"   on public.menu_items;
drop policy if exists "Authenticated can read all menu items"  on public.menu_items;
drop policy if exists "Authenticated can insert menu items"    on public.menu_items;
drop policy if exists "Authenticated can update menu items"    on public.menu_items;
drop policy if exists "Authenticated can delete menu items"    on public.menu_items;

-- 6. New per-user policies for menu_items
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

-- 7. Update waiter_requests policies
drop policy if exists "Anyone can insert waiter requests"         on public.waiter_requests;
drop policy if exists "Authenticated can read waiter requests"   on public.waiter_requests;
drop policy if exists "Authenticated can update waiter requests" on public.waiter_requests;
drop policy if exists "Authenticated can delete waiter requests" on public.waiter_requests;

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
