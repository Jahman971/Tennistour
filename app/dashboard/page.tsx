import Link from "next/link";
import { CalendarPlus, Dumbbell, Swords, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase, profile } = await requireSession();
  const [{ count: playerCount }, { count: coachCount }, { count: matchCount }, { count: trainingCount }] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["coach", "coach_principal"]),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "match"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "training")
  ]);

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
        {profile.role === "admin" || profile.role === "coach_principal" ? (
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
      <Card className="mt-6">
        <CardTitle>Tournée</CardTitle>
        <p className="mt-2 text-sm text-white/60">Retrouvez ici les indicateurs principaux et les actions rapides.</p>
      </Card>
    </AppShell>
  );
}
