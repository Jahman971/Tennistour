# TennisTour

Organisez et pilotez vos tournées de tennis.

TennisTour est une application Next.js 15 connectée à Supabase pour gérer les tournées, coachs, joueurs, matchs, entraînements, résultats, débriefs et notifications parents.

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

Charger les données de départ :

```bash
supabase db reset
```

La migration crée :

- `profiles`
- `tournees`
- `players`
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
- Parent : uniquement planning, résultats et notifications de son enfant.

## Authentification

Les comptes sont gérés par Supabase Auth. À la création d’un utilisateur, un trigger crée automatiquement un `profile` avec le rôle `parent` par défaut. Modifier le rôle dans `profiles` après invitation ou création du compte.

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
- fallback offline vers la connexion
- réception d’événements Push Web

Pour la production, brancher l’envoi Push côté serveur via Supabase Edge Functions ou un backend Vercel utilisant les abonnements navigateur.
