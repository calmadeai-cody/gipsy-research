-- GipsyAI Supabase Schema
-- Migration from Prisma/PostgreSQL to Supabase

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  created_at timestamp with time zone default now()
);

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  tier text not null default 'BASIC',
  status text not null default 'inactive',
  period text not null default 'MONTHLY',
  current_period_end timestamp with time zone,
  midtrans_order_id text,
  midtrans_transaction_id text,
  created_at timestamp with time zone default now()
);

-- Tool usage tracking
create table public.tool_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  tool_name text not null,
  input_text text,
  output_text text,
  tokens integer,
  created_at timestamp with time zone default now()
);

-- Articles (if used)
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  content text,
  category text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tool_usage enable row level security;
alter table public.articles enable row level security;

-- Policies (authenticated users manage own data)
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users can manage own subscription" on public.subscriptions for all using (auth.uid() = user_id);
create policy "Users can manage own tool usage" on public.tool_usage for all using (auth.uid() = user_id);
create policy "Users can manage own articles" on public.articles for all using (auth.uid() = user_id);

-- Allow users to sign up
create policy "Allow signups" on public.profiles for insert with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();