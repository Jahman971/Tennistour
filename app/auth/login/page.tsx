import { Suspense } from "react";
import Link from "next/link";
import { KeyRound, Trophy } from "lucide-react";
import { signIn, signUpCoach } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginForm({ searchParams }: { searchParams: { error?: string; mode?: string } }) {
  const isSignup = searchParams.mode === "signup";

  return (
    <Card className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-card bg-accent text-black">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <CardTitle>TennisTour</CardTitle>
          <p className="text-sm text-white/55">Espace réservé aux coachs.</p>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link href="/auth/login"><Button type="button" variant={!isSignup ? "primary" : "secondary"} className="w-full">Connexion</Button></Link>
        <Link href="/auth/login?mode=signup"><Button type="button" variant={isSignup ? "primary" : "secondary"} className="w-full">Inscription</Button></Link>
      </div>
      <form action={isSignup ? signUpCoach : signIn} className="grid gap-4">
        {isSignup ? <Input name="full_name" placeholder="Nom / prénom" autoComplete="name" required /> : null}
        <Input name="login" placeholder="Identifiant" autoComplete="username" pattern="[A-Za-z0-9._-]+" required />
        <Input name="password" type="password" placeholder="Mot de passe" autoComplete={isSignup ? "new-password" : "current-password"} minLength={6} required />
        {searchParams.error ? <p className="rounded-card border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{decodeURIComponent(searchParams.error)}</p> : null}
        <Button type="submit">
          <KeyRound className="h-4 w-4" />
          {isSignup ? "S'inscrire" : "Se connecter"}
        </Button>
      </form>
      <Link href="/" className="mt-5 block text-center text-sm text-white/55 hover:text-accent">Retour au suivi parent</Link>
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
