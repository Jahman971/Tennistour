import { createDebrief, createMatch, createTraining, publishResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Event, Player, Profile, Tournee } from "@/types/database";

export function TrainingForm({ tournees, coaches, players }: { tournees: Tournee[]; coaches: Profile[]; players: Player[] }) {
  return (
    <form action={createTraining} className="grid gap-4">
      <Select name="tournee_id" required>{tournees.map((tournee) => <option key={tournee.id} value={tournee.id}>{tournee.name}</option>)}</Select>
      <Input name="day_date" type="date" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="start_time" type="time" aria-label="Heure de début" required />
        <Input name="end_time" type="time" aria-label="Heure de fin" required />
      </div>
      <Select name="coach_id" required>{coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.full_name}</option>)}</Select>
      <Input name="location" placeholder="Lieu" required />
      <Input name="theme" placeholder="Thème" required />
      <fieldset className="grid gap-2 rounded-card border border-white/10 p-3">
        <legend className="px-1 text-sm font-semibold text-white/70">Joueurs</legend>
        {players.map((player) => (
          <label key={player.id} className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" name="player_ids" value={player.id} className="h-4 w-4 accent-accent" />
            {player.full_name}
          </label>
        ))}
      </fieldset>
      <Button type="submit">Créer l'entraînement</Button>
    </form>
  );
}

export function MatchForm({ tournees, players }: { tournees: Tournee[]; players: Player[] }) {
  return (
    <form action={createMatch} className="grid gap-4">
      <Select name="tournee_id" required>{tournees.map((tournee) => <option key={tournee.id} value={tournee.id}>{tournee.name}</option>)}</Select>
      <Select name="player_id" required>{players.map((player) => <option key={player.id} value={player.id}>{player.full_name}</option>)}</Select>
      <Input name="day_date" type="date" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="start_time" type="time" aria-label="Heure de début" required />
        <Input name="end_time" type="time" aria-label="Heure de fin" required />
      </div>
      <Input name="tournament" placeholder="Tournoi" required />
      <Input name="opponent" placeholder="Adversaire" required />
      <Button type="submit">Créer le match</Button>
    </form>
  );
}

export function ResultForm({ events, players }: { events: Event[]; players: Player[] }) {
  return (
    <form action={publishResult} className="grid gap-4">
      <Select name="event_id" required>{events.map((event) => <option key={event.id} value={event.id}>{event.title} - {event.day_date}</option>)}</Select>
      <Select name="player_id" required>{players.map((player) => <option key={player.id} value={player.id}>{player.full_name}</option>)}</Select>
      <Input name="opponent" placeholder="Adversaire" required />
      <Input name="score" placeholder="Score, ex. 6/4 6/3" required />
      <Select name="result" required><option value="win">Victoire</option><option value="loss">Défaite</option></Select>
      <Button type="submit">Publier</Button>
    </form>
  );
}

export function DebriefForm({ events, players }: { events: Event[]; players: Player[] }) {
  const criteria = [
    ["mental", "Mental /5"],
    ["service", "Service /5"],
    ["return_game", "Retour /5"],
    ["movement", "Déplacement /5"],
    ["tactics", "Tactique /5"],
    ["emotion", "Gestion émotionnelle /5"]
  ];

  return (
    <form action={createDebrief} className="grid gap-4">
      <Select name="event_id" required>{events.map((event) => <option key={event.id} value={event.id}>{event.title} - {event.day_date}</option>)}</Select>
      <Select name="player_id" required>{players.map((player) => <option key={player.id} value={player.id}>{player.full_name}</option>)}</Select>
      <div className="grid gap-3 sm:grid-cols-2">
        {criteria.map(([name, label]) => <Input key={name} name={name} type="number" min={1} max={5} placeholder={label} required />)}
      </div>
      <Textarea name="comment" placeholder="Commentaire libre" />
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
