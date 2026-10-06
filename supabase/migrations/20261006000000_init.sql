-- Lumo: initial schema
-- Run once in Supabase → SQL Editor (or `supabase db push`).
-- Every table is private to its owner via Row Level Security.

-- ───────────────────────── helpers ─────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── profiles ─────────────────────────
-- One row per auth user, created automatically on sign-up.

create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default '' check (char_length(display_name) <= 40),
  avatar_url    text,
  language      text not null default 'system',
  theme         text not null default 'system' check (theme in ('system', 'light', 'dark')),
  timezone      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Create the profile when a user signs up. Email sign-up sends display_name;
-- Google sends full_name/name and avatar_url/picture.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ), 40),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── habits ─────────────────────────

create table if not exists public.habits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 60),
  icon              text not null,
  color             text not null,
  time_of_day       text not null default 'morning' check (time_of_day in ('morning', 'workload', 'night')),
  target            integer not null default 1 check (target between 1 and 999),
  unit              text,
  frequency         jsonb not null default '{"type":"daily"}',
  reminder_enabled  boolean not null default false,
  reminder_time     time,
  sort_order        integer not null default 0,
  archived          boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists habits_user_idx on public.habits (user_id, archived, sort_order);

create trigger habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

alter table public.habits enable row level security;

create policy "habits: read own"   on public.habits for select using (auth.uid() = user_id);
create policy "habits: insert own" on public.habits for insert with check (auth.uid() = user_id);
create policy "habits: update own" on public.habits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits: delete own" on public.habits for delete using (auth.uid() = user_id);

-- ───────────────────────── habit_logs ─────────────────────────
-- One row per habit per day. value = progress toward the habit's target.

create table if not exists public.habit_logs (
  habit_id    uuid not null references public.habits (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day         date not null,
  value       integer not null default 0 check (value >= 0),
  updated_at  timestamptz not null default now(),
  primary key (habit_id, day)
);

create index if not exists habit_logs_user_day_idx on public.habit_logs (user_id, day);

create trigger habit_logs_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();

alter table public.habit_logs enable row level security;

create policy "logs: read own"   on public.habit_logs for select using (auth.uid() = user_id);
create policy "logs: insert own" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "logs: update own" on public.habit_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "logs: delete own" on public.habit_logs for delete using (auth.uid() = user_id);

-- ───────────────────────── avatars (storage) ─────────────────────────
-- Public-read bucket; users may only write inside a folder named after their user id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: upload own"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: update own"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: delete own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ───────────────────────── account deletion ─────────────────────────
-- Lets a signed-in user permanently delete their own account (cascades to all their data).
-- The app removes the user's avatar files through the Storage API first
-- (Supabase doesn't allow deleting storage objects directly from SQL).

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
