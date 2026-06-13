# TennisTour

Organisez et pilotez vos tournées de tennis.

TennisTour est une application Next.js 15 connectée à Supabase pour gérer les tournées, coachs, joueurs, matchs, entraînements, résultats, débriefs et accès parents par code.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- TailwindCSS
- Supabase Auth, Postgres et Row Level Security
- Lucide Icons
- PWA installable avec service worker
- Vercel

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Renseigner ensuite la clé anonyme Supabase dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://oijaymahnevydzfgqlhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=replace-with-your-supabase-anon-key
```

## Supabase

Appliquer la migration :

```bash
supabase db push
```

La migration crée :

- `profiles`
- `teams`
- `tournees`
- `players` avec un `code` public de suivi
- `tournee_coaches`
- `events` avec `start_time` et `end_time` pour chaque créneau
- `event_players`
- `match_results`
- `debriefs`
- `notifications`

Les policies RLS limitent les accès :

- Admin : accès total.
- Coach principal : gestion de sa tournée.
- Coach : planning, résultats, joueurs et débriefs de sa tournée.
- Parent : aucun compte, accès uniquement par code joueur.

## Connexion

L'application ne demande pas de créer les coachs manuellement dans Supabase.

Accès parent :

1. Ouvrir `/`.
2. Entrer le code joueur transmis par le coach.
3. Le planning et les résultats du joueur s'affichent sans compte utilisateur.
4. Les débriefs et commentaires coach ne sont jamais affichés dans cet espace.

Accès coach :

1. Ouvrir `/auth/login`.
2. Se connecter avec un identifiant simple, par exemple `jimmy`, et un mot de passe.
3. Pour créer un compte coach, utiliser l'onglet `Inscription`.
4. Après inscription, créer son équipe ou rejoindre une équipe avec le code d'invitation.
5. Un coach qui rejoint une équipe reste en attente jusqu'à validation par le coach principal.

Le coach principal voit le code d'invitation de son équipe dans le dashboard et valide les coachs adjoints depuis le même écran.

## Déploiement Vercel

Créer les variables d’environnement dans Vercel :

```env
NEXT_PUBLIC_SUPABASE_URL=https://oijaymahnevydzfgqlhi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

Puis connecter le dépôt GitHub et déployer la branche `main`.

## PWA et notifications

Les fichiers PWA sont dans `public/manifest.json`, `public/sw.js` et `public/register-sw.js`.

Le service worker gère :

- cache minimal de l’application
- mode hors ligne minimal
- réception d’événements Push Web

Pour la production, brancher l’envoi Push côté serveur via Supabase Edge Functions ou un backend Vercel utilisant les abonnements navigateur.
