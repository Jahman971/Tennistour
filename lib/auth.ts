import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export async function requireSession() {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();

  if (!profile) {
    redirect("/auth/login");
  }

  return { supabase, user, profile };
}
