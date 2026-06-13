create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists team_id uuid references public.teams(id) on delete set null,
  add column if not exists profile_status text not null default 'actif' check (profile_status in ('actif', 'en_attente'));

alter table public.players
  add column if not exists code text;

update public.players
set code = upper(substr(replace(id::text, '-', ''), 1, 5))
where code is null;

alter table public.players
  alter column code set not null;

create unique index if not exists players_code_key on public.players(code);
create index if not exists profiles_team_id_idx on public.profiles(team_id);
create index if not exists teams_code_idx on public.teams(code);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, profile_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'coach'),
    'actif'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

alter table public.teams enable row level security;

drop policy if exists "teams_select_authenticated" on public.teams;
create policy "teams_select_authenticated" on public.teams
  for select using (auth.uid() is not null);

drop policy if exists "teams_insert_authenticated" on public.teams;
create policy "teams_insert_authenticated" on public.teams
  for insert with check (auth.uid() = created_by);

drop policy if exists "teams_update_owner_or_admin" on public.teams;
create policy "teams_update_owner_or_admin" on public.teams
  for update using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "players_public_code_lookup" on public.players;
create policy "players_public_code_lookup" on public.players
  for select using (code is not null);

drop policy if exists "events_public_player_code_lookup" on public.events;
create policy "events_public_player_code_lookup" on public.events
  for select using (
    exists (
      select 1
      from public.event_players ep
      join public.players p on p.id = ep.player_id
      where ep.event_id = events.id
        and p.code is not null
    )
  );

drop policy if exists "event_players_public_player_code_lookup" on public.event_players;
create policy "event_players_public_player_code_lookup" on public.event_players
  for select using (
    exists (
      select 1
      from public.players p
      where p.id = event_players.player_id
        and p.code is not null
    )
  );

drop policy if exists "match_results_public_player_code_lookup" on public.match_results;
create policy "match_results_public_player_code_lookup" on public.match_results
  for select using (
    exists (
      select 1
      from public.players p
      where p.id = match_results.player_id
        and p.code is not null
    )
  );
