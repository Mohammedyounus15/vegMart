
-- Tables
create table if not exists vegetables (
  id text primary key,
  name text not null,
  category text not null default 'Vegetable',
  price numeric not null,
  unit text not null default 'kg',
  stock boolean not null default true,
  emoji text default '🥗'
);

create table if not exists orders (
  id text primary key,
  items jsonb not null,
  total numeric not null,
  customer_name text not null,
  phone text not null,
  address text not null,
  slot text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  lat double precision,
  lng double precision
);

create table if not exists settings (
  id text primary key default 'main',
  owner_phone text default '',
  owner_pin text default ''
);

-- Ensure orders columns exist even if created before lat/lng were added
alter table orders add column if not exists lat double precision;
alter table orders add column if not exists lng double precision;

-- Seed settings
insert into settings (id) values ('main')
on conflict (id) do nothing;

-- Seed vegetables
insert into vegetables (id, name, category, price, unit, stock, emoji) values
  ('v1','Tomato','Vegetable',34,'kg',true,'🍅'),
  ('v2','Onion','Vegetable',28,'kg',true,'🧅'),
  ('v3','Potato','Vegetable',22,'kg',true,'🥔'),
  ('v4','Spinach','Leafy',18,'bunch',true,'🥬'),
  ('v5','Carrot','Vegetable',40,'kg',true,'🥕'),
  ('v6','Brinjal','Vegetable',32,'kg',false,'🍆'),
  ('v7','Coriander','Leafy',10,'bunch',true,'🌿'),
  ('v8','Lemon','Fruit',6,'piece',true,'🍋'),
  ('v9','Capsicum','Vegetable',45,'kg',true,'🫑')
on conflict (id) do nothing;

-- Enable RLS
alter table vegetables enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- Vegetables policies (idempotent)
drop policy if exists "public read vegetables" on vegetables;
create policy "public read vegetables"
on vegetables for select
to public
using (true);

drop policy if exists "public insert vegetables" on vegetables;
create policy "public insert vegetables"
on vegetables for insert
to public
with check (true);

drop policy if exists "public update vegetables" on vegetables;
create policy "public update vegetables"
on vegetables for update
to public
using (true);

drop policy if exists "public delete vegetables" on vegetables;
create policy "public delete vegetables"
on vegetables for delete
to public
using (true);

-- Orders policies (idempotent)
drop policy if exists "public read orders" on orders;
create policy "public read orders"
on orders for select
to public
using (true);

drop policy if exists "public insert orders" on orders;
create policy "public insert orders"
on orders for insert
to public
with check (true);

drop policy if exists "public update orders" on orders;
create policy "public update orders"
on orders for update
to public
using (true);

-- Settings policies (idempotent)
drop policy if exists "public read settings" on settings;
create policy "public read settings"
on settings for select
to public
using (true);

drop policy if exists "public update settings" on settings;
create policy "public update settings"
on settings for update
to public
using (true);
