-- À coller dans Supabase > SQL Editor > New query, puis "Run".

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits on delete cascade not null,
  user_id uuid references auth.users not null,
  date date not null,
  unique (habit_id, date)
);

-- Sécurité : chaque utilisateur ne voit et ne modifie que ses propres données.
alter table habits enable row level security;
alter table habit_logs enable row level security;

create policy "Voir ses propres habitudes"
  on habits for select using (auth.uid() = user_id);
create policy "Créer ses propres habitudes"
  on habits for insert with check (auth.uid() = user_id);
create policy "Modifier ses propres habitudes"
  on habits for update using (auth.uid() = user_id);
create policy "Supprimer ses propres habitudes"
  on habits for delete using (auth.uid() = user_id);

create policy "Voir ses propres coches"
  on habit_logs for select using (auth.uid() = user_id);
create policy "Créer ses propres coches"
  on habit_logs for insert with check (auth.uid() = user_id);
create policy "Supprimer ses propres coches"
  on habit_logs for delete using (auth.uid() = user_id);
