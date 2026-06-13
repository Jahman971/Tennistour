import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { ResultForm } from "@/components/forms";
import { requireSession } from "@/lib/auth";

type ResultRow = {
  id: string;
  opponent: string;
  score: string;
  result: "win" | "loss";
  players: { full_name: string } | null;
  events: { title: string; day_date: string } | null;
};

export default async function ResultsPage() {
  const { supabase, profile } = await requireSession();
  const [{ data: events }, { data: players }, { data: results }] = await Promise.all([
    supabase.from("events").select("*").eq("type", "match").order("day_date"),
    supabase.from("players").select("*").order("full_name"),
    supabase.from("match_results").select("*, players(full_name), events(title, day_date)").order("id").returns<ResultRow[]>()
  ]);

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardTitle>Résultats</CardTitle>
          <div className="mt-6"><ResultForm events={events ?? []} players={players ?? []} /></div>
        </Card>
        <div className="grid gap-3">
          {(results ?? []).map((result) => (
            <Card key={result.id} className="p-4">
              <p className="font-semibold text-white">{result.players?.full_name} vs {result.opponent}</p>
              <p className="text-sm text-white/55">{result.score} - {result.result === "win" ? "Victoire" : "Défaite"}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
