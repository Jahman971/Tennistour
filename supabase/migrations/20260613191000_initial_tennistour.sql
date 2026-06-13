create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin', 'coach_principal', 'coach', 'parent')),
  parent_player_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.tournees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  constraint tournees_valid_dates check (end_date >= start_date)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  tournee_id uuid not null references public.tournees(id) on delete cascade,
  full_name text not null,
  birth_year integer,
  ranking text,
  parent_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_parent_player_id_fkey foreign key (parent_player_id) references public.players(id) on delete set null;

create table if not exists public.tournee_coaches (
  id uuid primary key default gen_random_uuid(),
  tournee_id uuid not null references public.tournees(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  is_principal boolean not null default false,
  unique (tournee_id, coach_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  tournee_id uuid not null references public.tournees(id) on delete cascade,
  type text not null check (type in ('match', 'training')),
  day_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null,
  details text,
  coach_id uuid references public.profiles(id) on delete set null,
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'completed', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint events_valid_time_range check (end_time > start_time)
);

create table if not exists public.event_players (
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  primary key (event_id, player_id)
);

create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  opponent text not null,
  score text not null,
  result text not null check (result in ('win', 'loss')),
  unique (event_id, player_id)
);

create table if not exists public.debriefs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  mental integer not null check (mental between 1 and 5),
  service integer not null check (service between 1 and 5),
  return_game integer not null check (return_game between 1 and 5),
  movement integer not null check (movement between 1 and 5),
  tactics integer not null check (tactics between 1 and 5),
  emotion integer not null check (emotion between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists players_tournee_id_idx on public.players(tournee_id);
create index if not exists events_tournee_day_idx on public.events(tournee_id, day_date, start_time);
create index if not exists event_players_player_idx on public.event_players(player_id);
create index if not exists notifications_profile_idx on public.notifications(profile_id, created_at desc);

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('admin', 'coach_principal', 'coach'), false)
$$;

create or replace function public.is_tournee_coach(tournee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tournee_coaches tc
    where tc.tournee_id = tournee
      and tc.coach_id = auth.uid()
  ) or public.is_admin()
$$;

create or replace function public.can_manage_tournee(tournee uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.tournee_coaches tc
    where tc.tournee_id = tournee
      and tc.coach_id = auth.uid()
      and tc.is_principal = true
  )
$$;

create or replace function public.parent_player_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select parent_player_id from public.profiles where id = auth.uid()
$$;

create or replace function public.parent_can_access_event(event uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_players ep
    where ep.event_id = event
      and ep.player_id = public.parent_player_id()
  )
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'parent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.tournees enable row level security;
alter table public.players enable row level security;
alter table public.tournee_coaches enable row level security;
alter table public.events enable row level security;
alter table public.event_players enable row level security;
alter table public.match_results enable row level security;
alter table public.debriefs enable row level security;
alter table public.notifications enable row level security;

create policy "profiles_select_self_or_staff" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "profiles_update_self_limited" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "tournees_select_staff_or_parent_active" on public.tournees
  for select using (
    public.is_staff()
    or exists (select 1 from public.players p where p.tournee_id = id and p.id = public.parent_player_id())
  );
create policy "tournees_manage_admin_principal" on public.tournees
  for all using (public.is_admin() or public.can_manage_tournee(id)) with check (public.is_admin());

create policy "players_select_scoped" on public.players
  for select using (
    public.is_tournee_coach(tournee_id)
    or id = public.parent_player_id()
    or parent_profile_id = auth.uid()
  );
create policy "players_manage_admin_principal" on public.players
  for all using (public.can_manage_tournee(tournee_id)) with check (public.can_manage_tournee(tournee_id));

create policy "tournee_coaches_select_staff" on public.tournee_coaches
  for select using (public.is_staff());
create policy "tournee_coaches_manage_admin_principal" on public.tournee_coaches
  for all using (public.can_manage_tournee(tournee_id)) with check (public.can_manage_tournee(tournee_id));

create policy "events_select_scoped" on public.events
  for select using (public.is_tournee_coach(tournee_id) or public.parent_can_access_event(id));
create policy "events_insert_admin_principal" on public.events
  for insert with check (public.can_manage_tournee(tournee_id));
create policy "events_update_staff" on public.events
  for update using (public.can_manage_tournee(tournee_id) or coach_id = auth.uid()) with check (public.can_manage_tournee(tournee_id) or coach_id = auth.uid());
create policy "events_delete_admin_principal" on public.events
  for delete using (public.can_manage_tournee(tournee_id));

create policy "event_players_select_scoped" on public.event_players
  for select using (
    player_id = public.parent_player_id()
    or exists (select 1 from public.events e where e.id = event_id and public.is_tournee_coach(e.tournee_id))
  );
create policy "event_players_manage_admin_principal" on public.event_players
  for all using (exists (select 1 from public.events e where e.id = event_id and public.can_manage_tournee(e.tournee_id)))
  with check (exists (select 1 from public.events e where e.id = event_id and public.can_manage_tournee(e.tournee_id)));

create policy "match_results_select_scoped" on public.match_results
  for select using (
    player_id = public.parent_player_id()
    or exists (select 1 from public.events e where e.id = event_id and public.is_tournee_coach(e.tournee_id))
  );
create policy "match_results_manage_staff" on public.match_results
  for all using (exists (select 1 from public.events e where e.id = event_id and (public.can_manage_tournee(e.tournee_id) or e.coach_id = auth.uid())))
  with check (exists (select 1 from public.events e where e.id = event_id and (public.can_manage_tournee(e.tournee_id) or e.coach_id = auth.uid())));

create policy "debriefs_select_staff_only" on public.debriefs
  for select using (public.is_staff());
create policy "debriefs_insert_staff" on public.debriefs
  for insert with check (public.is_staff() and coach_id = auth.uid());
create policy "debriefs_update_own_or_manager" on public.debriefs
  for update using (
    coach_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and public.can_manage_tournee(e.tournee_id))
  )
  with check (
    coach_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and public.can_manage_tournee(e.tournee_id))
  );

create policy "notifications_select_own" on public.notifications
  for select using (profile_id = auth.uid() or public.is_admin());
create policy "notifications_update_own_read_state" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "notifications_insert_staff" on public.notifications
  for insert with check (public.is_staff());
