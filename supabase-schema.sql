-- ============================================
-- Label Padhega India — Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. Profiles table (auto-created on user signup)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Scans table (stores every label scan)
create table if not exists public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_name text not null,
  brand text,
  category text,
  safety_score integer not null default 0,
  fssai_compliant boolean default false,
  ingredients jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  disclaimer text,
  created_at timestamptz default now() not null
);

-- 3. Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.scans enable row level security;

-- 4. RLS Policies — Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. RLS Policies — Scans
create policy "Users can view own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans for delete
  using (auth.uid() = user_id);

-- 6. Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists (safe re-run)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Indexes for performance
create index if not exists idx_scans_user_id on public.scans(user_id);
create index if not exists idx_scans_created_at on public.scans(created_at desc);
