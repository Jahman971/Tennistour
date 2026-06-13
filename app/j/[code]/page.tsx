import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";

type PublicEventRow = {
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

type PublicResultRow = {
  id: string;
  event_id: string;
  score: string;
  opponent: string;
  result: "win" | "loss";
};
type PublicEvent = NonNullable<PublicEventRow["events"]>;
type PublicPlayer = {
  id: string;
  full_name: string;
  code: string;
};

export default async function PlayerCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createServerClient();
  const normalizedCode = code.toUpperCase();
  const { data: player } = await supabase.from("players").select("id,full_name,code").eq("code", normalizedCode).maybeSingle<PublicPlayer>();

  if (!player) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardTitle>Code introuvable</CardTitle>
          <p className="mt-3 text-sm text-white/55">Vérifiez le code transmis par le coach.</p>
          <Link href="/" className="mt-5 block"><Button type="button">Retour</Button></Link>
        </Card>
      </main>
    );
  }

  const [{ data: events }, { data: results }] = await Promise.all([
    supabase.from("event_players").select("events(id,type,day_date,start_time,end_time,title,details)").eq("player_id", player.id).returns<PublicEventRow[]>(),
    supabase.from("match_results").select("id,event_id,score,opponent,result").eq("player_id", player.id).returns<PublicResultRow[]>()
  ]);

  const resultsByEvent = new Map((results ?? []).map((result) => [result.event_id, result]));
  const visibleEvents = (events ?? []).map((row) => row.events).filter((event): event is PublicEvent => Boolean(event));

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl bg-background px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase text-white">{player.full_name}</h1>
          <p className="text-sm text-accent">Code {player.code}</p>
        </div>
        <Link href="/"><Button type="button" variant="secondary">Quitter</Button></Link>
      </div>
      <div className="grid gap-3">
        {visibleEvents.map((event) => {
          const result = resultsByEvent.get(event.id);
          return (
            <Card key={event.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/50">{formatDate(event.day_date)} · {formatTime(event.start_time)}-{formatTime(event.end_time)}</p>
                  <p className="mt-1 font-semibold text-white">{event.title}</p>
                  <p className="text-sm text-white/55">{event.type === "match" ? "Match" : "Entraînement"}</p>
                </div>
                {result ? <span className="rounded-card bg-accent px-3 py-1 text-sm font-bold text-black">{result.score}</span> : null}
              </div>
            </Card>
          );
        })}
        {visibleEvents.length === 0 ? <Card className="text-center text-sm text-white/60">Aucun événement planifié.</Card> : null}
      </div>
    </main>
  );
}
