-- Run this once in Supabase: Project > SQL Editor > New query > paste all > Run

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
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id text primary key default 'main',
  owner_phone text default '',
  owner_pin text default ''
);

insert into settings (id) values ('main')
on conflict (id) do nothing;

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

-- Row Level Security: since this app has no login system, we open read/write
-- to anyone holding the public "anon" key (which ships inside your site's code
-- anyway). This is fine for a small local shop MVP, but it means someone who
-- inspects your site's JS could write to your database directly. If you grow
-- past a single-shop MVP, add Supabase Auth and tighten these policies.

alter table vegetables enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

create policy "public read vegetables" on vegetables for select using (true);
create policy "public insert vegetables" on vegetables for insert with check (true);
create policy "public update vegetables" on vegetables for update using (true);
create policy "public delete vegetables" on vegetables for delete using (true);

create policy "public read orders" on orders for select using (true);
create policy "public insert orders" on orders for insert with check (true);
create policy "public update orders" on orders for update using (true);

create policy "public read settings" on settings for select using (true);
create policy "public update settings" on settings for update using (true);
