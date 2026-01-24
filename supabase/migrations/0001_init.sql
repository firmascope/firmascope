-- firmascop/kununutr initial schema

create extension if not exists "pgcrypto";

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  slug text not null unique,
  short_description text,
  city text,
  sector text,
  website_domain text,
  employee_size_bucket text,
  is_verified boolean not null default false,
  is_paid_profile boolean not null default false,
  created_by_role text not null default 'user',
  status text not null default 'active',
  rating_overall_avg numeric,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_companies_city on public.companies (city);
create index if not exists idx_companies_sector on public.companies (sector);
create index if not exists idx_companies_normalized_name on public.companies (normalized_name);

-- User profiles
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ip_hash text,
  rating_overall smallint not null,
  ratings_json jsonb,
  answers_json jsonb,
  text text not null,
  text_hash text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_company on public.reviews (company_id);
create index if not exists idx_reviews_user on public.reviews (user_id);
create index if not exists idx_reviews_created_at on public.reviews (created_at desc);
create index if not exists idx_reviews_text_hash on public.reviews (company_id, text_hash);

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_value smallint not null,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

create index if not exists idx_votes_review on public.votes (review_id);
create index if not exists idx_votes_company on public.votes (company_id);
create index if not exists idx_votes_user_created_at on public.votes (user_id, created_at desc);

-- Salaries
create table if not exists public.salaries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position text not null,
  city text not null,
  experience_years integer not null,
  work_type text not null,
  company_size_bucket text not null,
  net_monthly_try integer not null,
  ip_hash text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_salaries_company on public.salaries (company_id);
create index if not exists idx_salaries_user on public.salaries (user_id);

-- Interviews
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_data jsonb,
  text text not null,
  outcome text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_interviews_company on public.interviews (company_id);
create index if not exists idx_interviews_user on public.interviews (user_id);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id uuid not null,
  company_id uuid,
  report_reason text not null,
  report_text text,
  reported_by_user_id uuid references auth.users(id) on delete set null,
  ip_hash text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by_role text,
  resolution_action text,
  resolution_note text
);

create index if not exists idx_reports_status on public.reports (status);

-- Abuse signals
create table if not exists public.abuse_signals (
  id uuid primary key default gen_random_uuid(),
  ip_hash text,
  user_id uuid references auth.users(id) on delete set null,
  risk_score integer not null default 0,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

-- Company claims
create table if not exists public.company_claims (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Paid profile extensions
create table if not exists public.company_profiles_paid (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  logo_url text,
  hero_image_url text,
  long_description text,
  featured boolean not null default false,
  analytics jsonb,
  created_at timestamptz not null default now()
);

-- Archive tables
create table if not exists public.reviews_archived (
  id uuid primary key default gen_random_uuid(),
  original_id uuid not null,
  company_id uuid not null,
  user_id uuid,
  content_type text not null default 'review',
  snapshot_text text not null,
  rating_overall smallint,
  ratings_json jsonb,
  answers_json jsonb,
  created_at timestamptz,
  deleted_at timestamptz not null default now(),
  deleted_by_role text not null,
  delete_reason text
);

create table if not exists public.salaries_archived (
  id uuid primary key default gen_random_uuid(),
  original_id uuid not null,
  company_id uuid not null,
  user_id uuid,
  content_type text not null default 'salary',
  snapshot_text text not null,
  created_at timestamptz,
  deleted_at timestamptz not null default now(),
  deleted_by_role text not null,
  delete_reason text
);

create table if not exists public.interviews_archived (
  id uuid primary key default gen_random_uuid(),
  original_id uuid not null,
  company_id uuid not null,
  user_id uuid,
  content_type text not null default 'interview',
  snapshot_text text not null,
  created_at timestamptz,
  deleted_at timestamptz not null default now(),
  deleted_by_role text not null,
  delete_reason text
);

-- Security definer functions for archive
create or replace function public.move_to_archive_review(
  p_review_id uuid,
  p_deleted_by_role text,
  p_delete_reason text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.reviews%rowtype;
begin
  select * into r from public.reviews where id = p_review_id;
  if not found then
    raise exception 'review not found';
  end if;

  insert into public.reviews_archived (
    original_id, company_id, user_id, snapshot_text, rating_overall, ratings_json, answers_json,
    created_at, deleted_by_role, delete_reason
  ) values (
    r.id, r.company_id, r.user_id, r.text, r.rating_overall, r.ratings_json, r.answers_json,
    r.created_at, p_deleted_by_role, p_delete_reason
  );

  delete from public.reviews where id = p_review_id;
end;
$$;

create or replace function public.move_to_archive_salary(
  p_salary_id uuid,
  p_deleted_by_role text,
  p_delete_reason text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.salaries%rowtype;
begin
  select * into s from public.salaries where id = p_salary_id;
  if not found then
    raise exception 'salary not found';
  end if;

  insert into public.salaries_archived (
    original_id, company_id, user_id, snapshot_text, created_at, deleted_by_role, delete_reason
  ) values (
    s.id, s.company_id, s.user_id, s.position || '|' || s.city || '|' || s.net_monthly_try,
    s.created_at, p_deleted_by_role, p_delete_reason
  );

  delete from public.salaries where id = p_salary_id;
end;
$$;

create or replace function public.move_to_archive_interview(
  p_interview_id uuid,
  p_deleted_by_role text,
  p_delete_reason text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  i public.interviews%rowtype;
begin
  select * into i from public.interviews where id = p_interview_id;
  if not found then
    raise exception 'interview not found';
  end if;

  insert into public.interviews_archived (
    original_id, company_id, user_id, snapshot_text, created_at, deleted_by_role, delete_reason
  ) values (
    i.id, i.company_id, i.user_id, i.text, i.created_at, p_deleted_by_role, p_delete_reason
  );

  delete from public.interviews where id = p_interview_id;
end;
$$;

-- RLS
alter table public.companies enable row level security;
alter table public.user_profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.votes enable row level security;
alter table public.salaries enable row level security;
alter table public.interviews enable row level security;
alter table public.reports enable row level security;
alter table public.abuse_signals enable row level security;
alter table public.company_claims enable row level security;
alter table public.company_profiles_paid enable row level security;
alter table public.reviews_archived enable row level security;
alter table public.salaries_archived enable row level security;
alter table public.interviews_archived enable row level security;

-- Companies policies
create policy "companies_public_read" on public.companies
  for select using (status = 'active');
create policy "companies_user_insert" on public.companies
  for insert with check (auth.uid() is not null);

-- Reviews policies
create policy "reviews_public_read" on public.reviews
  for select using (status = 'active');
create policy "reviews_user_insert" on public.reviews
  for insert with check (auth.uid() = user_id);

-- Salaries policies (no public read)
create policy "salaries_user_insert" on public.salaries
  for insert with check (auth.uid() = user_id);

-- Interviews policies
create policy "interviews_user_insert" on public.interviews
  for insert with check (auth.uid() = user_id);

-- Votes policies
create policy "votes_user_insert" on public.votes
  for insert with check (auth.uid() = user_id);
create policy "votes_user_update" on public.votes
  for update using (auth.uid() = user_id);
create policy "votes_user_delete" on public.votes
  for delete using (auth.uid() = user_id);

-- Reports policies (public insert)
create policy "reports_public_insert" on public.reports
  for insert with check (true);

-- Archived tables: no public policies, only service role access
