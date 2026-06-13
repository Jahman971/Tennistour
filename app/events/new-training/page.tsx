import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { TrainingForm } from "@/components/forms";
import { requireSession } from "@/lib/auth";

export default async function NewTrainingPage() {
  const { supabase, profile } = await requireSession();
  const [{ data: tournees }, { data: coaches }, { data: players }] = await Promise.all([
    supabase.from("tournees").select("*").eq("status", "active"),
    supabase.from("profiles").select("*").in("role", ["admin", "coach_principal", "coach"]),
    supabase.from("players").select("*").order("full_name")
  ]);

  return (
    <AppShell profile={profile}>
      <Card className="max-w-2xl">
        <CardTitle>Création Entraînement</CardTitle>
        <div className="mt-6">
          <TrainingForm tournees={tournees ?? []} coaches={coaches ?? []} players={players ?? []} />
        </div>
      </Card>
    </AppShell>
  );
}
