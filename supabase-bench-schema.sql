-- Bench schema — run this in your Supabase SQL editor.
-- Safe to re-run: uses IF NOT EXISTS / upsert patterns.

-- ─── Tables ──────────────────────────────────────────────────────────

create table if not exists bench_cases (
  id                text primary key,
  case_type         text,
  patient           text,
  dentist_name      text,
  dentist_clinic    text,
  urgency           text    default 'normal',
  units             int     default 1,
  due_date          bigint,
  instructions      text,
  current_stage_idx int     default -1,
  stage_progress    jsonb   default '[]'::jsonb,
  status            text    default 'active',
  created_at        bigint,
  updated_at        bigint,
  dispatched        boolean default false,
  dispatched_at     bigint,
  cancel_reason     text,
  warranty          jsonb
);

create table if not exists bench_audit (
  id         text primary key,
  case_id    text references bench_cases(id) on delete cascade,
  at         bigint,
  actor_id   text,
  actor_name text,
  action     text,
  meta       jsonb default '{}'::jsonb
);
create index if not exists bench_audit_case_idx on bench_audit(case_id);

create table if not exists bench_notifications (
  id        text primary key,
  at        bigint,
  read      boolean default false,
  for_role  text,
  for_stage text,
  text      text,
  case_id   text
);

create table if not exists bench_lab_config (
  id     text primary key default 'default',
  config jsonb not null
);

-- ─── Realtime ────────────────────────────────────────────────────────
-- If the publication already exists these are no-ops on Supabase.
do $$
begin
  begin
    alter publication supabase_realtime add table bench_cases;
  exception when others then null; end;
  begin
    alter publication supabase_realtime add table bench_audit;
  exception when others then null; end;
  begin
    alter publication supabase_realtime add table bench_notifications;
  exception when others then null; end;
  begin
    alter publication supabase_realtime add table bench_lab_config;
  exception when others then null; end;
end $$;

-- ─── RLS: open for internal app (all lab users see all data) ─────────
alter table bench_cases         disable row level security;
alter table bench_audit         disable row level security;
alter table bench_notifications disable row level security;
alter table bench_lab_config    disable row level security;
