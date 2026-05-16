-- Chairside v2 — schema additions
-- Run this AFTER the main supabase-schema.sql
-- These extend the base schema with new features.

-- ─── Message templates ────────────────────────────────────────
-- Stores per-stage message templates owned by a technician's lab.
create table if not exists message_templates (
  id           uuid primary key default uuid_generate_v4(),
  service_id   uuid not null references services(id) on delete cascade,
  lab_id       uuid not null references labs(id) on delete cascade,
  stage_index  int  not null,
  body         text not null,
  created_at   timestamptz default now()
);

create index if not exists message_templates_service_id_idx on message_templates(service_id);

-- Allow lab owner to manage their templates
alter table message_templates enable row level security;

create policy "templates: lab owner read"
  on message_templates for select
  using (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

create policy "templates: lab owner insert"
  on message_templates for insert
  with check (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

create policy "templates: lab owner delete"
  on message_templates for delete
  using (exists (select 1 from labs where labs.id = lab_id and labs.owner_id = auth.uid()));

-- Allow case participants (dentist) to read templates for their cases
create policy "templates: dentist read via case"
  on message_templates for select
  using (exists (
    select 1 from cases c
    where c.service_id = service_id and c.dentist_id = auth.uid()
  ));

-- ─── Clinics — upsert safety ──────────────────────────────────
-- Add a unique constraint on owner_id so upsert works
alter table clinics
  add constraint clinics_owner_id_unique unique (owner_id);

-- ─── Labs — upsert safety ─────────────────────────────────────
alter table labs
  add constraint labs_owner_id_unique unique (owner_id);
