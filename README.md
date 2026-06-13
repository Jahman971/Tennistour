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

## Connexion

L'application n'embarque aucun compte de démonstration.

Pour se connecter :

1. Créer un utilisateur dans Supabase : `Authentication` puis `Users`.
2. Renseigner son email et son mot de passe.
3. Dans la table `profiles`, vérifier que la ligne a été créée automatiquement.
4. Attribuer le bon rôle dans `profiles.role` : `admin`, `coach_principal`, `coach` ou `parent`.
5. Pour un parent, renseigner `profiles.parent_player_id` avec l'identifiant du joueur concerné.
6. Ouvrir `/auth/login` et se connecter avec l'email et le mot de passe.

Pour créer le premier administrateur, créez l'utilisateur dans Supabase Auth puis mettez `profiles.role` à `admin`.

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
