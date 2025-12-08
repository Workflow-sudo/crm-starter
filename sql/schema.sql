-- events table: append-only event log
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  timestamp timestamptz not null default now(),
  visitor_id text,
  contact_id uuid, -- linked after stitching
  properties jsonb
);

-- visitors: last-known snapshot for anonymous sessions
create table if not exists visitors (
  visitor_id text primary key,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  ua text,
  meta jsonb
);

-- contacts
create table if not exists contacts (
  contact_id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text,
  name text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  properties jsonb
);

-- email events (opens, clicks)
create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(contact_id),
  email_id text,
  event_type text, -- open/click/delivered/bounce
  timestamp timestamptz default now(),
  properties jsonb
);

-- indices for fast lookups
create index on events (visitor_id);
create index on events (contact_id);
create index on visitors (last_seen);
create index on contacts (email);
