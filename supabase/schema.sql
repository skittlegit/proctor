create table if not exists public.assessment_settings (
  assessment_id text primary key,
  allow_without_media boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.assessment_settings enable row level security;
revoke all on public.assessment_settings from anon, authenticated;
