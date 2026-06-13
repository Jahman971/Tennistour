import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Dumbbell, Swords, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";
import { validateCoach } from "@/lib/actions";

type TeamRow = {
  id: string;
  name: string;
  code: string;
  created_by: string | null;
};

type PendingCoach = {
  id: string;
  full_name: string;
};

export default async function DashboardPage() {
  const { supabase, profile, user } = await requireSession();

  if ((profile.role === "coach" || profile.role === "coach_principal") && !profile.team_id) {
    redirect("/team");
  }

  if (profile.profile_status === "en_attente") {
    redirect("/waiting");
  }

  const { data: team } = profile.team_id
    ? await supabase.from("teams").select("id,name,code,created_by").eq("id", profile.team_id).maybeSingle<TeamRow>()
    : { data: null };

  const isPrincipal = profile.role === "admin" || profile.role === "coach_principal" || team?.created_by === user.id;

  const [{ count: playerCount }, { count: coachCount }, { count: matchCount }, { count: trainingCount }] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["coach", "coach_principal"]),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "match"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "training")
  ]);
  const { data: pendingCoaches } = isPrincipal && profile.team_id
    ? await supabase.from("profiles").select("id,full_name").eq("team_id", profile.team_id).eq("role", "coach").eq("profile_status", "en_attente").returns<PendingCoach[]>()
    : { data: [] as PendingCoach[] };

  const stats = [
    { label: "Joueurs", value: playerCount ?? 0, icon: UsersRound },
    { label: "Coachs", value: coachCount ?? 0, icon: Dumbbell },
    { label: "Matchs", value: matchCount ?? 0, icon: Swords },
    { label: "Entraînements", value: trainingCount ?? 0, icon: CalendarPlus }
  ];

  return (
    <AppShell profile={profile}>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-5xl font-bold uppercase text-white">Dashboard</h1>
          <p className="mt-1 text-white/55">Vue d'ensemble de votre tournée.</p>
        </div>
        {isPrincipal ? (
          <div className="flex gap-2">
            <Link href="/events/new-match"><Button type="button">Créer un match</Button></Link>
            <Link href="/events/new-training"><Button type="button" variant="secondary">Créer un entraînement</Button></Link>
          </div>
        ) : null}
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/55">{stat.label}</p>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-4 font-display text-5xl font-bold text-white">{stat.value}</p>
            </Card>
          );
        })}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {team ? (
          <Card>
            <CardTitle>{team.name}</CardTitle>
            <p className="mt-2 text-sm text-white/55">Code d'invitation coach</p>
            <div className="mt-3 inline-flex rounded-card border border-accent/40 bg-accent/10 px-4 py-2 font-display text-2xl font-bold tracking-normal text-accent">{team.code}</div>
          </Card>
        ) : null}
        {isPrincipal ? (
          <Card>
            <CardTitle>Coachs à valider</CardTitle>
            <div className="mt-4 grid gap-3">
              {(pendingCoaches ?? []).map((coach) => (
                <form key={coach.id} action={validateCoach} className="flex items-center justify-between gap-3 rounded-card bg-black/25 p-3">
                  <input type="hidden" name="profile_id" value={coach.id} />
                  <span className="text-sm text-white">{coach.full_name}</span>
                  <Button type="submit" className="h-9">Valider</Button>
                </form>
              ))}
              {(pendingCoaches ?? []).length === 0 ? <p className="text-sm text-white/55">Aucune demande en attente.</p> : null}
            </div>
          </Card>
        ) : null}
      </section>
    </AppShell>
  );
}
