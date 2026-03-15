import { SupabaseClient } from "@supabase/supabase-js";

type WeeklyReviewRow = {
  id: string;
  week_label: string;
};

export function getCurrentWeekLabel(date = new Date()) {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = normalized.getUTCDay() || 7;
  normalized.setUTCDate(normalized.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((normalized.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `Semana ${normalized.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getOrCreateCurrentWeekReviewId(supabase: SupabaseClient) {
  const weekLabel = getCurrentWeekLabel();

  const { data: existing, error: loadError } = await supabase
    .from("weekly_reviews")
    .select("id, week_label")
    .eq("week_label", weekLabel)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<WeeklyReviewRow>();

  if (loadError) {
    throw loadError;
  }

  if (existing) {
    return { reviewId: existing.id, weekLabel };
  }

  const { data: created, error: createError } = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel })
    .select("id, week_label")
    .single<WeeklyReviewRow>();

  if (createError || !created) {
    throw createError ?? new Error("No se pudo crear la revisión semanal.");
  }

  return { reviewId: created.id, weekLabel };
}
