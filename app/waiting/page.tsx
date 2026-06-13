import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export default async function WaitingPage() {
  const { profile } = await requireSession();

  if (profile.profile_status === "actif") {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardTitle>Inscription envoyée</CardTitle>
        <p className="mt-3 text-sm text-white/60">Votre compte est en attente de validation par le coach principal.</p>
        <form action={signOut} className="mt-5">
          <Button type="submit" variant="secondary" className="w-full">Se déconnecter</Button>
        </form>
      </Card>
    </main>
  );
}
