-- Waiter requests table
create table public.waiter_requests (
  id uuid primary key default gen_random_uuid(),
  table_number text not null,
  note text not null default '',
  items jsonb not null default '[]',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.waiter_requests enable row level security;

create policy "Anyone can insert waiter requests"
  on public.waiter_requests for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read waiter requests"
  on public.waiter_requests for select
  to authenticated
  using (true);

create policy "Authenticated can update waiter requests"
  on public.waiter_requests for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete waiter requests"
  on public.waiter_requests for delete
  to authenticated
  using (true);

-- Enable realtime for waiter_requests
alter publication supabase_realtime add table public.waiter_requests;
