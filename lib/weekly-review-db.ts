import { supabase } from "./supabase"

export async function saveWeeklyReview(data: any) {
  const { error } = await supabase
    .from("weekly_reviews")
    .insert([data])

  if (error) {
    console.error("Error saving weekly review:", error)
    throw error
  }
}

export async function getWeeklyReview() {
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("Error fetching weekly review:", error)
    return null
  }

  return data
}

export async function getWeeklyReviewHistory() {
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching review history:", error)
    return []
  }

  return data
}
export function getCurrentWeekLabel() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (date: Date) =>
    date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

  return `${format(start)} - ${format(end)}`;
}
