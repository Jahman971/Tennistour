-- ============================================================
-- Schéma Supabase — Suivi de tournois de tennis (live)
-- Rôles : admin / coach / parent / enfant
-- Les coachs sont regroupés en "équipes" (staff). Un coach principal
-- crée l'équipe et obtient un code d'invitation pour ses coachs adjoints.
-- Chaque joueur reçoit un code à 5 caractères transmis aux parents
-- pour suivre les matchs en direct.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- PROFILS (1 ligne par utilisateur auth)
-- ------------------------------------------------------------
create table profiles (
  id uuid references auth.users(id) primary key,
  role text check (role in ('admin','coach','parent','enfant')) not null,
  statut text check (statut in ('actif','en_attente')) not null default 'actif',
  nom text not null,
  team_id uuid,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- ÉQUIPES DE COACHS
-- ------------------------------------------------------------
create table teams (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  code text unique not null,        -- code d'invitation pour les coachs adjoints
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table profiles add constraint profiles_team_fk foreign key (team_id) references teams(id);

-- ------------------------------------------------------------
-- FORMATS DE MATCH (configurables, basés sur les formats FFT)
-- ------------------------------------------------------------
create table formats (
  id serial primary key,
  nom text not null,
  jeux_par_set int not null default 6,
  seuil_tiebreak int not null default 6,
  nb_sets_gagnants int not null default 2,
  super_tb_set_final boolean not null default true,
  points_super_tb int not null default 10,
  no_ad boolean not null default false
);

insert into formats (nom, jeux_par_set, seuil_tiebreak, nb_sets_gagnants, super_tb_set_final, points_super_tb, no_ad) values
('Classique (2x6 jeux, TB à 6/6, super TB au 3e set)', 6, 6, 2, true, 10, false),
('Format 7 (2x5 jeux, TB à 4/4, super TB au 3e set)', 5, 4, 2, true, 10, false),
('Format 6 (2x4 jeux, TB à 3/3, super TB au 3e set)', 4, 3, 2, true, 10, false),
('Format 5 (2x3 jeux, TB à 2/2, super TB au 3e set)', 3, 2, 2, true, 10, false),
('TMC Format 3 (2x4 jeux, TB NoAd, super TB au 3e set)', 4, 4, 2, true, 10, true),
('Set unique (1x6 jeux, TB à 6/6)', 6, 6, 1, false, 10, false);

-- ------------------------------------------------------------
-- TOURNOIS (rattachés à une équipe)
-- ------------------------------------------------------------
create table tournaments (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  lieu text,
  date_debut date,
  date_fin date,
  format_id int references formats(id) not null,
  team_id uuid references teams(id) not null,
  coach_id uuid references profiles(id) not null,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- JOUEURS (effectif de l'équipe, code à 5 caractères pour le suivi parent)
-- ------------------------------------------------------------
create table players (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  code text unique not null,
  team_id uuid references teams(id),
  profile_id uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- INSCRIPTIONS À UN TOURNOI
-- ------------------------------------------------------------
create table tournament_players (
  tournament_id uuid references tournaments(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  primary key (tournament_id, player_id)
);

-- ------------------------------------------------------------
-- MATCHS (score live en JSONB)
-- ------------------------------------------------------------
create table matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references tournaments(id) on delete cascade,
  joueur1_id uuid references players(id),
  joueur2_id uuid references players(id),
  court text,
  tour text,
  statut text not null default 'a_venir' check (statut in ('a_venir','en_cours','termine')),
  live_state jsonb not null default '{}'::jsonb,
  winner_id uuid references players(id),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------
-- SUIVI (un parent suit un ou plusieurs joueurs via leur code)
-- ------------------------------------------------------------
create table follows (
  parent_id uuid references profiles(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  primary key (parent_id, player_id)
);

-- ============================================================
-- FONCTIONS UTILES POUR LA RLS (security definer)
-- ============================================================
create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_coach() returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'coach');
$$;

-- Coach actif (validé par le coach principal de son équipe)
create or replace function is_active_coach() returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'coach' and statut = 'actif');
$$;

-- L'utilisateur est-il le coach principal (créateur) de l'équipe donnée ?
create or replace function is_team_principal(tid uuid) returns boolean
language sql security definer set search_path = public as $$
  select exists(select 1 from teams where id = tid and created_by = auth.uid());
$$;

create or replace function my_team_id() returns uuid
language sql security definer set search_path = public as $$
  select team_id from profiles where id = auth.uid();
$$;

create or replace function team_of_tournament(tid uuid) returns uuid
language sql security definer set search_path = public as $$
  select team_id from tournaments where id = tid;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table teams enable row level security;
alter table formats enable row level security;
alter table tournaments enable row level security;
alter table players enable row level security;
alter table tournament_players enable row level security;
alter table matches enable row level security;
alter table follows enable row level security;

-- PROFILES
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on profiles for update using (auth.uid() = id or is_admin());

-- Le coach principal peut valider/gérer les coachs adjoints de son équipe
create policy "profiles_update_by_principal" on profiles for update using (
  role = 'coach' and team_id is not null and is_team_principal(team_id)
);

-- TEAMS : lecture publique, création par un coach, mise à jour par le créateur ou l'admin
create policy "teams_select_all" on teams for select using (true);
create policy "teams_insert_coach" on teams for insert with check (is_coach());
create policy "teams_update_owner" on teams for update using (created_by = auth.uid() or is_admin());

-- FORMATS : lecture publique
create policy "formats_select_all" on formats for select using (true);

-- TOURNAMENTS : lecture publique, écriture par un coach de l'équipe propriétaire (ou admin)
create policy "tournaments_select_all" on tournaments for select using (true);
create policy "tournaments_insert_coach" on tournaments for insert with check (
  is_admin() or (is_active_coach() and team_id = my_team_id())
);
create policy "tournaments_update_team" on tournaments for update using (
  is_admin() or (is_active_coach() and team_id = my_team_id())
);
create policy "tournaments_delete_team" on tournaments for delete using (
  is_admin() or (is_active_coach() and team_id = my_team_id())
);

-- PLAYERS : lecture publique, gestion par les coachs de l'équipe (ou admin), claim par l'enfant
create policy "players_select_all" on players for select using (true);
create policy "players_insert_team" on players for insert with check (
  is_admin() or (is_active_coach() and team_id = my_team_id())
);
create policy "players_update_team_or_claim" on players for update using (
  is_admin()
  or (is_active_coach() and team_id = my_team_id())
  or profile_id is null
  or profile_id = auth.uid()
);

-- TOURNAMENT_PLAYERS : lecture publique, gestion par l'équipe du tournoi (ou admin)
create policy "tp_select_all" on tournament_players for select using (true);
create policy "tp_insert_team" on tournament_players for insert with check (
  is_admin() or (is_active_coach() and team_of_tournament(tournament_id) = my_team_id())
);
create policy "tp_delete_team" on tournament_players for delete using (
  is_admin() or (is_active_coach() and team_of_tournament(tournament_id) = my_team_id())
);

-- MATCHES : lecture publique, gestion par l'équipe du tournoi (ou admin)
create policy "matches_select_all" on matches for select using (true);
create policy "matches_insert_team" on matches for insert with check (
  is_admin() or (is_active_coach() and team_of_tournament(tournament_id) = my_team_id())
);
create policy "matches_update_team" on matches for update using (
  is_admin() or (is_active_coach() and team_of_tournament(tournament_id) = my_team_id())
);

-- FOLLOWS : chacun gère ses propres suivis
create policy "follows_select_own" on follows for select using (auth.uid() = parent_id);
create policy "follows_insert_own" on follows for insert with check (auth.uid() = parent_id);
create policy "follows_delete_own" on follows for delete using (auth.uid() = parent_id);

-- ============================================================
-- REALTIME : activer la réplication sur matches pour le live
-- ============================================================
alter publication supabase_realtime add table matches;

-- ============================================================
-- DEVENIR ADMINISTRATEUR
-- ============================================================
-- Crée d'abord ton compte normalement dans l'app (rôle "coach" par ex.),
-- puis exécute la commande suivante en remplaçant l'email :
--
-- update profiles set role = 'admin', team_id = null
-- where id = (select id from auth.users where email = 'ton-email@exemple.com');
