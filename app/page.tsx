import Link from "next/link";
import { ArrowRight, KeyRound, Trophy } from "lucide-react";
import { openPlayerCode } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-xl place-items-center bg-background px-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-card bg-accent text-black">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="font-display text-5xl font-bold uppercase text-accent">TennisTour</h1>
          <p className="mt-2 text-sm text-white/55">Suivi de tournées tennis en direct</p>
        </div>
        <Card>
          <CardTitle>Code joueur</CardTitle>
          <form action={openPlayerCode} className="mt-4 flex gap-2">
            <Input name="code" placeholder="CODE" maxLength={5} className="uppercase" autoCapitalize="characters" required />
            <Button type="submit" aria-label="Ouvrir le suivi">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-3 text-sm text-white/50">Entrez le code transmis par le coach pour suivre le planning et les résultats.</p>
        </Card>
        <Link href="/auth/login" className="mt-4 block">
          <Button type="button" variant="secondary" className="w-full">
            <KeyRound className="h-4 w-4" />
            Accès Coach
          </Button>
        </Link>
      </div>
    </main>
  );
}
