import Link from "next/link";
import { CalendarDays, ClipboardList, Home, LogOut, MessageSquareText, Trophy, UserRound } from "lucide-react";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/results", label: "Résultats", icon: Trophy },
  { href: "/debriefs", label: "Débriefs", icon: ClipboardList },
  { href: "/parent", label: "Parent", icon: UserRound }
];

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-surface px-4 py-6 lg:block">
        <Link href="/dashboard" className="block">
          <p className="font-display text-4xl font-bold uppercase text-accent">TennisTour</p>
          <p className="mt-1 text-xs text-white/55">Organisez et pilotez vos tournées de tennis.</p>
        </Link>
        <nav className="mt-10 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex h-11 items-center gap-3 rounded-card px-3 text-sm font-medium text-white/72 hover:bg-white/10 hover:text-white">
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-background/90 px-4 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm font-semibold text-white">{profile.full_name}</p>
            <p className="text-xs uppercase text-white/45">{profile.role.replace("_", " ")}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" aria-label="Déconnexion" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
      <div className="fixed bottom-4 right-4 rounded-full border border-white/10 bg-surface p-3 text-accent shadow-xl lg:hidden">
        <MessageSquareText className="h-5 w-5" />
      </div>
    </div>
  );
}
