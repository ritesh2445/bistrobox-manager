-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_name text not null,
  sort_order int not null default 0
);

alter table public.categories enable row level security;

create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

create policy "Authenticated can insert categories"
  on public.categories for insert
  to authenticated
  with check (true);

create policy "Authenticated can update categories"
  on public.categories for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete categories"
  on public.categories for delete
  to authenticated
  using (true);

-- Menu items table
create table public.menu_items (
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

alter table public.menu_items enable row level security;

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.menu_items
  for each row
  execute function public.update_updated_at();

create policy "Public can read available menu items"
  on public.menu_items for select
  to anon
  using (is_available = true);

create policy "Authenticated can read all menu items"
  on public.menu_items for select
  to authenticated
  using (true);

create policy "Authenticated can insert menu items"
  on public.menu_items for insert
  to authenticated
  with check (true);

create policy "Authenticated can update menu items"
  on public.menu_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete menu items"
  on public.menu_items for delete
  to authenticated
  using (true);

-- Analytics table
create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.analytics enable row level security;

create policy "Anyone can insert analytics"
  on public.analytics for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read analytics"
  on public.analytics for select
  to authenticated
  using (true);

-- Storage bucket for menu images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

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

-- Enable realtime for menu_items
alter publication supabase_realtime add table public.menu_items;

-- Seed data
insert into public.categories (name, icon_name, sort_order) values
  ('Burgers', 'hamburger', 1),
  ('Fries & Sides', 'utensils', 2),
  ('Cold Coffee', 'coffee', 3),
  ('Hot Beverages', 'flame', 4),
  ('Desserts', 'cake', 5);

insert into public.menu_items (category_id, name, description, price, image_url, is_featured, is_available) values
  ((select id from public.categories where name = 'Burgers'), 'Classic Smash Burger', 'Hand-smashed patty with melted cheese, caramelised onions, and our signature sauce on a toasted brioche bun.', 249, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', true, true),
  ((select id from public.categories where name = 'Burgers'), 'Crispy Chicken Burger', 'Crispy fried chicken thigh with tangy slaw, pickles, and spicy mayo on a soft sesame bun.', 229, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&q=80', false, true),
  ((select id from public.categories where name = 'Cold Coffee'), 'Cold Brew Latte', 'Slow-steeped cold brew blended with fresh milk and served over ice for a smooth, bold finish.', 179, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80', true, true),
  ((select id from public.categories where name = 'Cold Coffee'), 'Caramel Frappé', 'Blended iced coffee with rich caramel syrup, milk, and topped with whipped cream and a caramel drizzle.', 199, 'https://images.unsplash.com/photo-1643034989098-bde867ebfe7d?w=800&q=80', false, true),
  ((select id from public.categories where name = 'Fries & Sides'), 'Loaded Masala Fries', 'Crispy golden fries tossed in our house masala spice blend, served with mint chutney dip.', 129, 'https://images.unsplash.com/photo-1576107232684-1279f390858e?w=800&q=80', false, true),
  ((select id from public.categories where name = 'Desserts'), 'Belgian Waffle', 'Fluffy Belgian waffle dusted with powdered sugar, served with fresh berries and a scoop of vanilla ice cream.', 219, 'https://images.unsplash.com/photo-1562376552-0d160a2f14b5?w=800&q=80', false, false);