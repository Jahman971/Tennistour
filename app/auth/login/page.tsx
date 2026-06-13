import { Suspense } from "react";
import { Trophy } from "lucide-react";
import { signIn } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginForm({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-card bg-accent text-black">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <CardTitle>TennisTour</CardTitle>
          <p className="text-sm text-white/55">Organisez et pilotez vos tournées de tennis.</p>
        </div>
      </div>
      <form action={signIn} className="grid gap-4">
        <Input name="email" type="email" placeholder="Email" autoComplete="email" required />
        <Input name="password" type="password" placeholder="Mot de passe" autoComplete="current-password" required />
        {searchParams.error ? <p className="rounded-card border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{decodeURIComponent(searchParams.error)}</p> : null}
        <Button type="submit">Connexion</Button>
      </form>
    </Card>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_70%_20%,rgba(215,229,82,0.16),transparent_30%),#0C0C0C] px-4">
      <Suspense>
        <LoginForm searchParams={params} />
      </Suspense>
    </main>
  );
}
