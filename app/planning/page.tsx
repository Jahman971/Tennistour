import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth";
import { cn, formatDate, formatTime } from "@/lib/utils";

type PlanningRow = {
  id: string;
  type: "match" | "training";
  day_date: string;
  start_time: string;
  end_time: string;
  title: string;
  details: string | null;
  profiles: { full_name: string } | null;
  event_players: { players: { full_name: string } | null }[];
};

export default async function PlanningPage() {
  const { supabase, profile } = await requireSession();
  const { data: events } = await supabase
    .from("events")
    .select("id,type,day_date,start_time,end_time,title,details,profiles:coach_id(full_name),event_players(players(full_name))")
    .order("day_date")
    .order("start_time")
    .returns<PlanningRow[]>();

  return (
    <AppShell profile={profile}>
      <h1 className="font-display text-5xl font-bold uppercase text-white">Planning</h1>
      <div className="mt-6 grid gap-3">
        {(events ?? []).map((event) => (
          <Card key={event.id} className="p-4">
            <div className="grid gap-4 md:grid-cols-[140px_90px_130px_1fr_160px] md:items-center">
              <p className="text-sm font-semibold text-white">{formatDate(event.day_date)}</p>
              <p className="text-sm text-white/65">{formatTime(event.start_time)}-{formatTime(event.end_time)}</p>
              <span className={cn("w-fit rounded-card px-3 py-1 text-xs font-bold uppercase text-black", event.type === "match" ? "bg-warning" : "bg-sky-400")}>
                {event.type === "match" ? "Match" : "Entraînement"}
              </span>
              <div>
                <p className="font-semibold text-white">{event.title}</p>
                <p className="text-sm text-white/50">{event.event_players.map((row) => row.players?.full_name).filter(Boolean).join(", ")}</p>
              </div>
              <p className="text-sm text-white/55">{event.profiles?.full_name ?? "Coach à affecter"}</p>
            </div>
          </Card>
        ))}
        {(events ?? []).length === 0 ? <Card className="text-sm text-white/60">Aucun événement planifié.</Card> : null}
      </div>
    </AppShell>
  );
}
