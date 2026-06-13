import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { DebriefForm } from "@/components/forms";
import { requireSession } from "@/lib/auth";

type DebriefRow = {
  id: string;
  mental: number;
  service: number;
  tactics: number;
  comment: string | null;
  players: { full_name: string } | null;
  profiles: { full_name: string } | null;
};

export default async function DebriefsPage() {
  const { supabase, profile } = await requireSession();

  if (profile.role === "parent") {
    redirect("/");
  }

  const [{ data: events }, { data: players }, { data: debriefs }] = await Promise.all([
    supabase.from("events").select("*").order("day_date"),
    supabase.from("players").select("*").order("full_name"),
    supabase.from("debriefs").select("*, players(full_name), profiles:coach_id(full_name)").order("created_at", { ascending: false }).returns<DebriefRow[]>()
  ]);

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <Card>
          <CardTitle>Débrief Coach</CardTitle>
          <div className="mt-6"><DebriefForm events={events ?? []} players={players ?? []} /></div>
        </Card>
        <div className="grid gap-3">
          {(debriefs ?? []).map((debrief) => (
            <Card key={debrief.id} className="p-4">
              <p className="font-semibold text-white">{debrief.players?.full_name}</p>
              <p className="mt-1 text-sm text-white/55">Mental {debrief.mental}/5 · Service {debrief.service}/5 · Tactique {debrief.tactics}/5</p>
              <p className="mt-3 text-sm text-white/75">{debrief.comment}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
