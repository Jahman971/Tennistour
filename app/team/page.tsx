import { redirect } from "next/navigation";
import { createTeam, joinTeam } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ profile }, params] = await Promise.all([requireSession(), searchParams]);

  if (profile.team_id && profile.profile_status === "actif") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-3xl place-items-center bg-background px-4 py-8">
      <div className="grid w-full gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>Créer mon équipe</CardTitle>
          <p className="mt-2 text-sm text-white/55">Créez l'équipe de votre club. Un code sera généré pour inviter les coachs adjoints.</p>
          <form action={createTeam} className="mt-5 grid gap-4">
            <Input name="name" placeholder="Nom de l'équipe / club" required />
            <Button type="submit">Créer l'équipe</Button>
          </form>
        </Card>
        <Card>
          <CardTitle>Rejoindre</CardTitle>
          <p className="mt-2 text-sm text-white/55">Entrez le code donné par le coach principal.</p>
          <form action={joinTeam} className="mt-5 grid gap-4">
            <Input name="code" placeholder="CODE" className="uppercase" required />
            {params.error ? <p className="rounded-card border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{params.error}</p> : null}
            <Button type="submit" variant="secondary">Rejoindre l'équipe</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
