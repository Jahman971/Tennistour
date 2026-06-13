import { AppShell } from "@/components/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { MatchForm } from "@/components/forms";
import { requireSession } from "@/lib/auth";

export default async function NewMatchPage() {
  const { supabase, profile } = await requireSession();
  const [{ data: tournees }, { data: players }] = await Promise.all([
    supabase.from("tournees").select("*").eq("status", "active"),
    supabase.from("players").select("*").order("full_name")
  ]);

  return (
    <AppShell profile={profile}>
      <Card className="max-w-2xl">
        <CardTitle>Création Match</CardTitle>
        <div className="mt-6">
          <MatchForm tournees={tournees ?? []} players={players ?? []} />
        </div>
      </Card>
    </AppShell>
  );
}
