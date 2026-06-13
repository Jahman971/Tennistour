import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/utils";

type ParentEventRow = {
  events: {
    id: string;
    type: "match" | "training";
    day_date: string;
    start_time: string;
    end_time: string;
    title: string;
    details: string | null;
  } | null;
};
type ParentEvent = NonNullable<ParentEventRow["events"]>;

type ParentResultRow = {
  id: string;
  score: string;
  result: "win" | "loss";
};

type ParentNotificationRow = {
  id: string;
  title: string;
};

export default async function ParentPage() {
  const { supabase, profile } = await requireSession();
  const playerId = profile.parent_player_id;

  const [{ data: events }, { data: results }, { data: notifications }] = await Promise.all([
    playerId
      ? supabase.from("event_players").select("events(id,type,day_date,start_time,end_time,title,details)").eq("player_id", playerId).returns<ParentEventRow[]>()
      : Promise.resolve({ data: [] as ParentEventRow[] }),
    playerId ? supabase.from("match_results").select("id,score,result").eq("player_id", playerId).returns<ParentResultRow[]>() : Promise.resolve({ data: [] as ParentResultRow[] }),
    supabase.from("notifications").select("id,title").order("created_at", { ascending: false }).returns<ParentNotificationRow[]>()
  ]);

  const visibleEvents = (events ?? []).map((row) => row.events).filter((event): event is ParentEvent => Boolean(event));
  const nextMatch = visibleEvents.filter((event) => event.type === "match").sort((a, b) => `${a.day_date}${a.start_time}`.localeCompare(`${b.day_date}${b.start_time}`))[0];

  return (
    <AppShell profile={profile}>
      <h1 className="font-display text-5xl font-bold uppercase text-white">Espace Parent</h1>
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Prochain match</CardTitle>
          {nextMatch ? <p className="mt-4 text-white">{formatDate(nextMatch.day_date)} de {formatTime(nextMatch.start_time)} à {formatTime(nextMatch.end_time)}<br />{nextMatch.title}</p> : <p className="mt-4 text-sm text-white/55">Aucun match programmé.</p>}
        </Card>
        <Card>
          <CardTitle>Historique</CardTitle>
          <div className="mt-4 grid gap-2">
            {(results ?? []).map((result) => <p key={result.id} className="text-sm text-white/70">{result.score} - {result.result === "win" ? "Victoire" : "Défaite"}</p>)}
          </div>
        </Card>
        <Card>
          <CardTitle>Notifications</CardTitle>
          <div className="mt-4 grid gap-2">
            {(notifications ?? []).map((notification) => <p key={notification.id} className="text-sm text-white/70">{notification.title}</p>)}
          </div>
        </Card>
      </section>
      <Card className="mt-6">
        <CardTitle>Planning du joueur</CardTitle>
        <div className="mt-4 grid gap-2">
          {visibleEvents.map((event) => (
            <p key={event.id} className="text-sm text-white/70">{formatDate(event.day_date)} {formatTime(event.start_time)}-{formatTime(event.end_time)} - {event.title}</p>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
