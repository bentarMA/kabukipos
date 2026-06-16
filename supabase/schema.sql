-- Kabukiro POS — Supabase Schema
-- Jalankan di SQL Editor Supabase saat deploy production

create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null,
  emoji text default '🍜',
  description text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists sales (
  id text primary key,
  invoice_number text not null,
  items jsonb not null,
  subtotal integer not null,
  tax integer default 0,
  discount integer default 0,
  total integer not null,
  payment_method text not null,
  amount_paid integer not null,
  change_amount integer default 0,
  cashier_id text not null,
  cashier_name text not null,
  customer_name text,
  created_at timestamptz default now()
);

create table if not exists daily_recaps (
  id text primary key,
  date date not null unique,
  data jsonb not null,
  closed_at timestamptz not null,
  closed_by text not null,
  email_sent boolean default false,
  email_sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists sales_created_at_idx on sales (created_at desc);
create index if not exists sales_cashier_id_idx on sales (cashier_id);
create index if not exists daily_recaps_date_idx on daily_recaps (date desc);
