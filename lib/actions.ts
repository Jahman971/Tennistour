"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const AUTH_DOMAIN = "@tennistour.local";

function loginToEmail(login: FormDataEntryValue | null) {
  const clean = String(login ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
  return `${clean}${AUTH_DOMAIN}`;
}

function generateCode(length = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

async function currentUserId() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return { supabase, userId: user.id };
}

export async function signIn(formData: FormData) {
  const supabase = await createServerClient();
  const email = loginToEmail(formData.get("login"));
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.includes("Invalid login credentials")
      ? "Identifiant ou mot de passe incorrect. Si c'est votre première connexion, utilisez d'abord l'onglet Inscription."
      : error.message;
    redirect(`/auth/login?error=${encodeURIComponent(message)}`);
  }

  redirect("/dashboard");
}

export async function signUpCoach(formData: FormData) {
  const supabase = await createServerClient();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = loginToEmail(formData.get("login"));
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "coach"
      }
    }
  });

  if (error) {
    redirect(`/auth/login?mode=signup&error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(`/auth/login?error=${encodeURIComponent("Compte créé. La confirmation email est active dans Supabase : confirmez l'email ou désactivez la confirmation email, puis connectez-vous.")}`);
  }

  redirect("/team");
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createTeam(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const code = generateCode();
  const { data: team, error } = await (supabase.from("teams") as any)
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      code,
      created_by: userId
    })
    .select("id")
    .single();

  if (error || !team) {
    redirect(`/team?error=${encodeURIComponent(error?.message ?? "Impossible de créer l'équipe.")}`);
  }

  await (supabase.from("profiles") as any)
    .update({ team_id: team.id, profile_status: "actif", role: "coach_principal" })
    .eq("id", userId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinTeam(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const { data: team } = await supabase.from("teams").select("id").eq("code", code).maybeSingle<{ id: string }>();

  if (!team) {
    redirect("/team?error=Code d'invitation introuvable.");
  }

  await (supabase.from("profiles") as any)
    .update({ team_id: team.id, profile_status: "en_attente", role: "coach" })
    .eq("id", userId);

  redirect("/waiting");
}

export async function validateCoach(formData: FormData) {
  const { supabase } = await currentUserId();
  await (supabase.from("profiles") as any)
    .update({ profile_status: "actif" })
    .eq("id", String(formData.get("profile_id")));

  revalidatePath("/dashboard");
}

export async function openPlayerCode(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    redirect("/");
  }

  redirect(`/j/${code}`);
}

export async function createTraining(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const playerIds = formData.getAll("player_ids").map(String).filter(Boolean);

  const { data: event, error } = await (supabase.from("events") as any)
    .insert({
      tournee_id: String(formData.get("tournee_id")),
      type: "training",
      day_date: String(formData.get("day_date")),
      start_time: String(formData.get("start_time")),
      end_time: String(formData.get("end_time")),
      title: String(formData.get("theme")),
      details: `Lieu: ${String(formData.get("location"))}`,
      coach_id: String(formData.get("coach_id")),
      created_by: userId,
      status: "scheduled"
    })
    .select("id")
    .single();

  if (error || !event) {
    throw new Error(error?.message ?? "Training creation failed.");
  }

  if (playerIds.length > 0) {
    await (supabase.from("event_players") as any).insert(playerIds.map((playerId) => ({ event_id: event.id, player_id: playerId })));
  }

  revalidatePath("/planning");
  redirect("/planning");
}

export async function createMatch(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  const playerId = String(formData.get("player_id"));
  const opponent = String(formData.get("opponent"));

  const { data: event, error } = await (supabase.from("events") as any)
    .insert({
      tournee_id: String(formData.get("tournee_id")),
      type: "match",
      day_date: String(formData.get("day_date")),
      start_time: String(formData.get("start_time")),
      end_time: String(formData.get("end_time")),
      title: String(formData.get("tournament")),
      details: opponent ? `Adversaire: ${opponent}` : null,
      created_by: userId,
      status: "scheduled"
    })
    .select("id")
    .single();

  if (error || !event) {
    throw new Error(error?.message ?? "Match creation failed.");
  }

  await (supabase.from("event_players") as any).insert({ event_id: event.id, player_id: playerId });
  revalidatePath("/planning");
  redirect("/planning");
}

export async function publishResult(formData: FormData) {
  const { supabase } = await currentUserId();

  await (supabase.from("match_results") as any).upsert({
    event_id: String(formData.get("event_id")),
    player_id: String(formData.get("player_id")),
    opponent: String(formData.get("opponent")),
    score: String(formData.get("score")),
    result: String(formData.get("result")) as "win" | "loss"
  });

  await (supabase.from("events") as any).update({ status: "completed" }).eq("id", String(formData.get("event_id")));
  revalidatePath("/results");
}

export async function createDebrief(formData: FormData) {
  const { supabase, userId } = await currentUserId();

  await (supabase.from("debriefs") as any).insert({
    event_id: String(formData.get("event_id")),
    player_id: String(formData.get("player_id")),
    coach_id: userId,
    mental: Number(formData.get("mental")),
    service: Number(formData.get("service")),
    return_game: Number(formData.get("return_game")),
    movement: Number(formData.get("movement")),
    tactics: Number(formData.get("tactics")),
    emotion: Number(formData.get("emotion")),
    comment: String(formData.get("comment") ?? "")
  });

  revalidatePath("/debriefs");
}
