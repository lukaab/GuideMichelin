-- Run this in your Supabase SQL editor

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  xp integer default 0,
  level integer default 1,
  visited_restaurants integer[] default '{}',
  badges text[] default '{}',
  stats jsonb default '{
    "totalVisits": 0,
    "bibGourmandVisits": 0,
    "starredVisits": 0,
    "citiesExplored": [],
    "totalXP": 0
  }'::jsonb,
  updated_at timestamptz default now()
);

-- Allow users to read/write only their own profile
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
