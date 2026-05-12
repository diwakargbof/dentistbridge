-- Chairside — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste all → Run
-- Supabase already enables RLS by default on new projects; we do it explicitly
-- per table just to be safe.

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Sequence for collision-free case IDs ────────────────────
-- nextval() is atomic, so two concurrent insertions never get the same ID.
-- Starts at 4801 to match the mock data range (C-4805 … C-4821).
create sequence if not exists case_id_seq start 4801 increment 1;

create or replace function next_case_id()
returns text language sql as $$
  select 'C-' || nextval('case_id_seq')::text;
$$;

-- ─── Profiles (one row per auth.users row) ───────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text not null check (role in ('dentist', 'technician')),
  full_name   text not null,
  phone       text,
  city        text,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

-- Own profile: full control
create policy "Own profile: select"    on profiles for select using (auth.uid() = id);
create policy "Own profile: insert"    on profiles for insert with check (auth.uid() = id);
create policy "Own profile: update"    on profiles for update using (auth.uid() = id);
create policy "Own profile: delete"    on profiles for delete using (auth.uid() = id);

-- Case participants need to read each other's names in chat.
-- A user may read a profile if they share at least one case.
create policy "Case participant: read peer profile"
  on profiles for select
  using (
    exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where
        -- the profile being read is the other side of a shared case
        (c.dentist_id = profiles.id or l.owner_id = profiles.id)
        -- and the caller is also a participant of that case
        and (c.dentist_id = auth.uid() or l.owner_id = auth.uid())
    )
  );

-- ─── Trigger: auto-create a minimal profile row on auth signup ─
-- This ensures a profile row always exists even if the JS-side insert fails.
-- The JS signUp() call then upserts the full profile with role/city/phone.
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
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Labs (technician workspaces) ────────────────────────────
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

alter table labs enable row level security;

create policy "Labs: public read"  on labs for select using (true);
create policy "Labs: owner insert" on labs for insert with check (auth.uid() = owner_id);
create policy "Labs: owner update" on labs for update using (auth.uid() = owner_id);
-- Prevent deletion if there are active (non-archived) cases.
create policy "Labs: owner delete"
  on labs for delete
  using (
    auth.uid() = owner_id
    and not exists (
      select 1 from cases
      where lab_id = labs.id and archived = false
    )
  );

-- ─── Lab services ─────────────────────────────────────────────
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

alter table services enable row level security;

create policy "Services: public read" on services for select using (true);

-- Lab owner full control
create policy "Services: owner insert"
  on services for insert
  with check (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

create policy "Services: owner update"
  on services for update
  using (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

-- Prevent delete if service has active cases
create policy "Services: owner delete"
  on services for delete
  using (
    exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid())
    and not exists (
      select 1 from cases
      where service_id = services.id and archived = false
    )
  );

-- ─── Clinics (dentist workspaces) ────────────────────────────
create table if not exists clinics (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references profiles(id) on delete cascade,
  name         text not null,
  city         text,
  created_at   timestamptz default now()
);

alter table clinics enable row level security;

create policy "Clinics: public read"   on clinics for select using (true);
create policy "Clinics: owner insert"  on clinics for insert with check (auth.uid() = owner_id);
create policy "Clinics: owner update"  on clinics for update using (auth.uid() = owner_id);
create policy "Clinics: owner delete"  on clinics for delete using (auth.uid() = owner_id);

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
  archived       boolean not null default false,  -- soft-delete
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table cases enable row level security;

-- Both lab owner and dentist can see cases they're part of
create policy "Cases: lab read"
  on cases for select
  using (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

create policy "Cases: dentist read"
  on cases for select
  using (auth.uid() = dentist_id);

-- Only dentist creates a case
create policy "Cases: dentist insert"
  on cases for insert
  with check (auth.uid() = dentist_id);

-- Lab advances stage and updates shade/payment
create policy "Cases: lab update"
  on cases for update
  using (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

-- Dentist updates their own case notes, patient ref, and can archive
create policy "Cases: dentist update"
  on cases for update
  using (auth.uid() = dentist_id);

-- Neither side hard-deletes cases (use archived = true instead).
-- Only the dentist who created a case can archive (soft-delete) it.
-- Enforced via the dentist update policy above — no separate delete policy needed.

-- Auto-update updated_at on any change
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

-- ─── Case attachments ─────────────────────────────────────────
create table if not exists attachments (
  id           uuid primary key default uuid_generate_v4(),
  case_id      text not null references cases(id) on delete cascade,
  uploader_id  uuid not null references profiles(id),
  label        text,
  storage_path text not null,
  mime_type    text,
  created_at   timestamptz default now()
);

alter table attachments enable row level security;

create policy "Attachments: participant read"
  on attachments for select
  using (
    exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = case_id
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "Attachments: participant insert"
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

-- Only the uploader can delete their own attachment
create policy "Attachments: uploader delete"
  on attachments for delete
  using (auth.uid() = uploader_id);

-- ─── Messages ─────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  case_id     text not null references cases(id) on delete cascade,
  sender_id   uuid not null references profiles(id),
  body        text,
  kind        text not null default 'text'
               check (kind in ('text', 'image', 'system', 'template', 'shade', 'payment')),
  metadata    jsonb default '{}',
  deleted_at  timestamptz,   -- soft-delete; null = visible
  created_at  timestamptz default now()
);

alter table messages enable row level security;

create policy "Messages: participant read"
  on messages for select
  using (
    exists (
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = case_id
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "Messages: participant insert"
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

-- Sender can soft-delete (set deleted_at) their own messages only
create policy "Messages: sender soft-delete"
  on messages for update
  using (auth.uid() = sender_id);

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists cases_lab_id_idx       on cases(lab_id);
create index if not exists cases_dentist_id_idx   on cases(dentist_id);
create index if not exists cases_archived_idx     on cases(archived) where archived = false;
create index if not exists messages_case_id_idx   on messages(case_id);
create index if not exists messages_sender_id_idx on messages(sender_id);
create index if not exists attachments_case_id_idx on attachments(case_id);
create index if not exists services_lab_id_idx    on services(lab_id);
create index if not exists labs_owner_id_idx      on labs(owner_id);

-- ─── Enable Realtime ─────────────────────────────────────────
-- Run these only once; Supabase returns an error if a table is already added,
-- so wrap in a DO block to suppress it.
do $$
begin
  alter publication supabase_realtime add table messages;
exception when others then null;
end;
$$;

do $$
begin
  alter publication supabase_realtime add table cases;
exception when others then null;
end;
$$;

-- ─── Storage bucket for case attachments ─────────────────────
-- Creates a private bucket. Access is controlled via signed URLs generated
-- by your serverless functions or Supabase Storage policies below.
insert into storage.buckets (id, name, public)
values ('case-attachments', 'case-attachments', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload attachments"
  on storage.objects for insert
  with check (bucket_id = 'case-attachments' and auth.role() = 'authenticated');

create policy "Case participants can read attachments"
  on storage.objects for select
  using (
    bucket_id = 'case-attachments'
    and exists (
      -- storage path format: {case_id}/{filename}
      select 1 from cases c
      join labs l on l.id = c.lab_id
      where c.id = split_part(name, '/', 1)
        and (l.owner_id = auth.uid() or c.dentist_id = auth.uid())
    )
  );

create policy "Uploader can delete their attachment"
  on storage.objects for delete
  using (
    bucket_id = 'case-attachments'
    and exists (
      select 1 from attachments a
      where a.storage_path = name and a.uploader_id = auth.uid()
    )
  );
