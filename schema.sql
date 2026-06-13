-- ============================================================
-- SetPoint — Schema Supabase programmation de tournée tennis
-- Rôles : admin / coach_principal / coach / parent
-- Principe : un joueur appartient à une seule tournée active.
-- Un entraînement peut regrouper plusieurs joueurs.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','coach_principal','coach','parent')),
  parent_player_id uuid null,
  created_at timestamptz default now()
);

create table if not exists tournees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('draft','active','closed')),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tournee_id uuid not null references tournees(id) on delete cascade,
  full_name text not null,
  category text,
  ranking text,
  parent_profile_id uuid references profiles(id),
  active boolean default true,
  created_at timestamptz default now()
);

alter table profiles
  add constraint profiles_parent_player_fk
  foreign key (parent_player_id) references players(id) deferrable initially deferred;

create table if not exists tournee_coaches (
  tournee_id uuid references tournees(id) on delete cascade,
  coach_id uuid references profiles(id) on delete cascade,
  is_principal boolean default false,
  primary key (tournee_id, coach_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  tournee_id uuid not null references tournees(id) on delete cascade,
  type text not null check (type in ('match','training')),
  day_date date not null,
  start_time time not null,
  title text not null,
  details text,
  coach_id uuid references profiles(id),
  status text default 'planned' check (status in ('planned','live','done','cancelled')),
  score text,
  result text check (result in ('win','loss') or result is null),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists event_players (
  event_id uuid references events(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  primary key (event_id, player_id)
);

create table if not exists debriefs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  coach_id uuid references profiles(id),
  mental int check (mental between 1 and 5),
  service int check (service between 1 and 5),
  return_game int check (return_game between 1 and 5),
  movement int check (movement between 1 and 5),
  tactics int check (tactics between 1 and 5),
  emotion int check (emotion between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table tournees enable row level security;
alter table players enable row level security;
alter table tournee_coaches enable row level security;
alter table events enable row level security;
alter table event_players enable row level security;
alter table debriefs enable row level security;
alter table notifications enable row level security;

drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select using (auth.uid() is not null);

drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists tournees_read on tournees;
create policy tournees_read on tournees for select using (auth.uid() is not null);

drop policy if exists tournees_write_staff on tournees;
create policy tournees_write_staff on tournees for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
);

drop policy if exists players_read on players;
create policy players_read on players for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
  or parent_profile_id = auth.uid()
);

drop policy if exists players_write_staff on players;
create policy players_write_staff on players for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
);

drop policy if exists tournee_coaches_read on tournee_coaches;
create policy tournee_coaches_read on tournee_coaches for select using (auth.uid() is not null);

drop policy if exists tournee_coaches_write_staff on tournee_coaches;
create policy tournee_coaches_write_staff on tournee_coaches for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
);

drop policy if exists events_read on events;
create policy events_read on events for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
  or exists (
    select 1 from event_players ep
    join players pl on pl.id = ep.player_id
    where ep.event_id = events.id and pl.parent_profile_id = auth.uid() and events.type = 'match'
  )
);

drop policy if exists events_write_staff on events;
create policy events_write_staff on events for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
);

drop policy if exists event_players_read on event_players;
create policy event_players_read on event_players for select using (auth.uid() is not null);

drop policy if exists event_players_write_staff on event_players;
create policy event_players_write_staff on event_players for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
);

drop policy if exists debriefs_read_staff on debriefs;
create policy debriefs_read_staff on debriefs for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
);

drop policy if exists debriefs_write_staff on debriefs;
create policy debriefs_write_staff on debriefs for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal','coach'))
);

drop policy if exists notifications_read_own on notifications;
create policy notifications_read_own on notifications for select using (profile_id = auth.uid());

drop policy if exists notifications_write_staff on notifications;
create policy notifications_write_staff on notifications for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','coach_principal'))
);

create index if not exists idx_players_tournee on players(tournee_id);
create index if not exists idx_events_tournee_date on events(tournee_id, day_date, start_time);
create index if not exists idx_event_players_player on event_players(player_id);
