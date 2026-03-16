import { SupabaseClient } from "@supabase/supabase-js";

type WeeklyReviewRow = {
  id: string;
  week_label: string;
};

export function getCurrentWeekLabel(date = new Date()): string {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = normalized.getUTCDay() || 7;
  normalized.setUTCDate(normalized.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((normalized.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `Semana ${normalized.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getOrCreateCurrentWeekReviewId(supabase: SupabaseClient): Promise<{ reviewId: string; weekLabel: string }> {
  const weekLabel = getCurrentWeekLabel();

  const { data: existing, error: loadError } = await supabase
    .from("weekly_reviews")
    .select("id, week_label")
    .eq("week_label", weekLabel)
    .eq("is_closed", false)
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
    .insert({ week_label: weekLabel, is_closed: false })
    .select("id, week_label")
    .single<WeeklyReviewRow>();

  if (createError || !created) {
    throw createError ?? new Error("No se pudo crear la revisión semanal.");
  }

  return { reviewId: created.id, weekLabel };
}

export async function closeCurrentWeekAndCreateNext(supabase: SupabaseClient): Promise<void> {
  const { reviewId, weekLabel } = await getOrCreateCurrentWeekReviewId(supabase);

  const { error: closeError } = await supabase
    .from("weekly_reviews")
    .update({ is_closed: true, closed_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (closeError) {
    throw closeError;
  }

  const { error: createError } = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel, is_closed: false });

  if (createError) {
    throw createError;
  }
}
