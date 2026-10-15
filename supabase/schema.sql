-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).

create table if not exists public.site_content (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Visitors may read content; only the server (service-role key) may write it.
drop policy if exists "Public read site_content" on public.site_content;
create policy "Public read site_content"
  on public.site_content for select
  using (true);

-- Optional: stores messages sent through the contact form (service-role only, no public policies).
create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text,
  email       text,
  message     text,
  created_at  timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
