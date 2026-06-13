"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

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
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
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
