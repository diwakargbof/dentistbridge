-- Chairside — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste all → Run
--
-- Key rule: PostgreSQL validates USING expressions at CREATE POLICY time,
-- so any policy that references another table must be created AFTER that
-- table exists. All cross-table policies are therefore deferred to the end.

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Sequence for collision-free case IDs ────────────────────
-- nextval() is atomic — two concurrent inserts never get the same ID.
create sequence if not exists case_id_seq start 4801 increment 1;

create or replace function next_case_id()
returns text language sql as $$
  select 'C-' || nextval('case_id_seq')::text;
$$;

-- ─────────────────────────────────────────────────────────────
-- TABLES (all tables first, then policies)
-- ─────────────────────────────────────────────────────────────

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text not null check (role in ('dentist', 'technician')),
  full_name   text not null,
  phone       text,
  city        text,
  created_at  timestamptz default now()
);

-- ─── Labs ────────────────────────────────────────────────────
create table if not exists labs (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  name         text not null,
  city         text,
  bio          text,
  turnaround   text,
  rating       numeric(3,1) default 5.0,
  jobs_count   int default 0,
  verified     boolean default false,
  created_at   timestamptz default now()
);

-- ─── Services ────────────────────────────────────────────────
create table if not exists services (
  id           uuid primary key default uuid_generate_v4(),
  lab_id       uuid not null references labs(id) on delete cascade,
  title        text not null,
  description  text,
  price        numeric(10,2) not null,
  stages       text[] not null default '{}',
  active       boolean default true,
  created_at   timestamptz default now()
);

-- ─── Clinics ─────────────────────────────────────────────────
create table if not exists clinics (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  name         text not null,
  city         text,
  created_at   timestamptz default now()
);

-- ─── Cases ───────────────────────────────────────────────────
create table if not exists cases (
  id             text primary key default next_case_id(),
  lab_id         uuid not null references labs(id),
  dentist_id     uuid not null references profiles(id),
  service_id     uuid not null references services(id),
  patient_ref    text,
  stage          int not null default 0,
  notes          text,
  shade          text,
  payment_status text not null default 'pending'
                  check (payment_status in ('pending', 'received', 'confirmed')),
  payment_amount numeric(10,2),
  archived       boolean not null default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Attachments ─────────────────────────────────────────────
create table if not exists attachments (
  id           uuid primary key default uuid_generate_v4(),
  case_id      text not null references cases(id) on delete cascade,
  uploader_id  uuid not null references profiles(id),
  label        text,
  storage_path text not null,
  mime_type    text,
  created_at   timestamptz default now()
);

-- ─── Messages ────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  case_id     text not null references cases(id) on delete cascade,
  sender_id   uuid not null references profiles(id),
  body        text,
  kind        text not null default 'text'
               check (kind in ('text', 'image', 'system', 'template', 'shade', 'payment')),
  metadata    jsonb default '{}',
  deleted_at  timestamptz,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- TRIGGERS (after tables)
-- ─────────────────────────────────────────────────────────────

-- Auto-create a minimal profile row on auth signup.
-- JS signUp() then upserts the full profile with role/city/phone.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'dentist'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  -- Never block auth user creation if the profile insert fails.
  -- The JS signUp() call upserts the profile row as a fallback.
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at on cases.
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cases_updated_at on cases;
create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- RLS + POLICIES
-- All tables first, then policies. Cross-table policies (those whose
-- USING clause references a table other than the one being secured)
-- come last, after all referenced tables exist.
-- ─────────────────────────────────────────────────────────────

alter table profiles    enable row level security;
alter table labs        enable row level security;
alter table services    enable row level security;
alter table clinics     enable row level security;
alter table cases       enable row level security;
alter table attachments enable row level security;
alter table messages    enable row level security;

-- ── Profiles: self-only policies (no cross-table refs) ────────
create policy "profiles: own select" on profiles for select using (auth.uid() = id);
create policy "profiles: own insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on profiles for update using (auth.uid() = id);
create policy "profiles: own delete" on profiles for delete using (auth.uid() = id);

-- ── Labs: policies that don't reference cases ─────────────────
create policy "labs: public read"  on labs for select using (true);
create policy "labs: owner insert" on labs for insert with check (auth.uid() = owner_id);
create policy "labs: owner update" on labs for update using (auth.uid() = owner_id);

-- ── Services: policies that don't reference cases ─────────────
create policy "services: public read" on services for select using (true);

create policy "services: owner insert"
  on services for insert
  with check (exists (
    select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()
  ));

create policy "services: owner update"
  on services for update
  using (exists (
    select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()
  ));

-- ── Clinics: all policies (no cross-table refs) ───────────────
create policy "clinics: public read"   on clinics for select using (true);
create policy "clinics: owner insert"  on clinics for insert with check (auth.uid() = owner_id);
create policy "clinics: owner update"  on clinics for update using (auth.uid() = owner_id);
create policy "clinics: owner delete"  on clinics for delete using (auth.uid() = owner_id);

-- ── Cases: all policies (cases itself is the cross-table target) ─
create policy "cases: lab read"
  on cases for select
  using (exists (
    select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()
  ));

create policy "cases: dentist read"
  on cases for select
  using (auth.uid() = dentist_id);

create policy "cases: dentist insert"
  on cases for insert
  with check (auth.uid() = dentist_id);

create policy "cases: lab update"
  on cases for update
  using (exists (
    select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()
  ));

create policy "cases: dentist update"
  on cases for update
  using (auth.uid() = dentist_id);

-- ── Attachments: all policies ─────────────────────────────────
create policy "attachments: participant read"
  on attachments for select
  using (exists (
    select 1 from cases c
    join labs l on l.id = c.lab_id
    where c.id = case_id
      and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
  ));

create policy "attachments: participant insert"
  on attachments for insert
  with check (
    auth.uid() = uploader_id
    and exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = case_id
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "attachments: uploader delete"
  on attachments for delete
  using (auth.uid() = uploader_id);

-- ── Messages: all policies ────────────────────────────────────
create policy "messages: participant read"
  on messages for select
  using (exists (
    select 1 from cases c
    join labs l on l.id = c.lab_id
    where c.id = case_id
      and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
  ));

create policy "messages: participant insert"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = case_id
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "messages: sender soft-delete"
  on messages for update
  using (auth.uid() = sender_id);

-- ── Cross-table policies (must come after cases exists) ───────

-- Profiles: case participants can read each other's names in chat
create policy "profiles: case participant read"
  on profiles for select
  using (exists (
    select 1 from cases c
    join labs l on l.id = c.lab_id
    where
      (c.dentist_id = profiles.id or l.owner_id = profiles.id)
      and (c.dentist_id = auth.uid() or l.owner_id = auth.uid())
  ));

-- Labs: block delete if active cases exist
create policy "labs: owner delete"
  on labs for delete
  using (
    auth.uid() = owner_id
    and not exists (
      select 1 from cases
      where lab_id = labs.id and archived = false
    )
  );

-- Services: block delete if active cases reference it
create policy "services: owner delete"
  on services for delete
  using (
    exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid())
    and not exists (
      select 1 from cases
      where service_id = services.id and archived = false
    )
  );

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
create index if not exists cases_lab_id_idx        on cases(lab_id);
create index if not exists cases_dentist_id_idx    on cases(dentist_id);
create index if not exists cases_archived_idx      on cases(archived) where archived = false;
create index if not exists messages_case_id_idx    on messages(case_id);
create index if not exists messages_sender_id_idx  on messages(sender_id);
create index if not exists attachments_case_id_idx on attachments(case_id);
create index if not exists services_lab_id_idx     on services(lab_id);
create index if not exists labs_owner_id_idx       on labs(owner_id);

-- ─────────────────────────────────────────────────────────────
-- REALTIME
-- Wrapped in DO blocks so re-running the script doesn't error
-- if tables are already in the publication.
-- ─────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table messages;
exception when others then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table cases;
exception when others then null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- STORAGE
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('case-attachments', 'case-attachments', false)
on conflict (id) do nothing;

create policy "storage: authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'case-attachments' and auth.role() = 'authenticated');

create policy "storage: participant read"
  on storage.objects for select
  using (
    bucket_id = 'case-attachments'
    and exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = split_part(name, '/', 1)
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "storage: uploader delete"
  on storage.objects for delete
  using (
    bucket_id = 'case-attachments'
    and exists (
      select 1 from attachments a
      where a.storage_path = name and a.uploader_id = auth.uid()
    )
  );
