import { supabase } from "./supabaseClient";

export async function pullRemotePlannerState() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from("planner_states")
    .select("state_json")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data?.state_json ?? null;
}

export async function pushRemotePlannerState(state) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return state;

  const payload = {
    user_id: user.id,
    state_json: state,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("planner_states")
    .upsert(payload, { onConflict: "user_id" });

  if (error) throw error;

  return state;
}