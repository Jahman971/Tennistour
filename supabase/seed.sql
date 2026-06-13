insert into public.tournees (id, name, location, start_date, end_date, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Tournée Été 2026', 'Côte Atlantique', '2026-07-08', '2026-07-21', 'active')
on conflict (id) do nothing;

insert into public.players (id, tournee_id, full_name, birth_year, ranking)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Maïwenn Martin', 2011, '15/3'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Lucas Bernard', 2010, '15/2'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Nathan Petit', 2012, '30'),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Emma Laurent', 2011, '15/5')
on conflict (id) do nothing;

insert into public.events (id, tournee_id, type, day_date, start_time, end_time, title, details, status)
values
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'training', '2026-07-09', '10:00', '11:30', 'Intensité fond de court', 'Lieu: Court 4', 'scheduled'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'match', '2026-07-09', '15:30', '17:00', 'Open Jeunes Atlantique', 'Adversaire: à confirmer', 'scheduled')
on conflict (id) do nothing;

insert into public.event_players (event_id, player_id)
values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221'),
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222223'),
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222224'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221')
on conflict do nothing;
