import { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "./supabase"

function getRequiredSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client is not available")
  }
  return supabase
}

/**
 * Devuelve el label de la semana actual
 * ejemplo: "11 mar - 17 mar"
 */
export function getCurrentWeekLabel() {
  const now = new Date()

  const start = new Date(now)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)

  start.setDate(diff)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const format = (date: Date) =>
    date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    })

  return `${format(start)} - ${format(end)}`
}

/**
 * Obtiene o crea la revisión de la semana actual
 */
export async function getOrCreateCurrentWeekReviewId(client: SupabaseClient) {
  const weekLabel = getCurrentWeekLabel()

  const { data: existing, error: fetchError } = await client
    .from("weekly_reviews")
    .select("id")
    .eq("week_label", weekLabel)
    .maybeSingle()

  if (fetchError) {
    console.error("Error fetching weekly review", fetchError)
    throw fetchError
  }

  if (existing?.id) {
    return { reviewId: existing.id }
  }

  const { data: created, error: insertError } = await client
    .from("weekly_reviews")
    .insert([{ week_label: weekLabel }])
    .select("id")
    .single()

  if (insertError) {
    console.error("Error creating weekly review", insertError)
    throw insertError
  }

  return { reviewId: created.id }
}

/**
 * Guarda una revisión semanal completa
 */
export async function saveWeeklyReview(data: any) {
  const client = getRequiredSupabaseClient()

  const { error } = await client
    .from("weekly_reviews")
    .insert([data])

  if (error) {
    console.error("Error saving weekly review:", error)
    throw error
  }
}

/**
 * Obtiene la última revisión semanal
 */
export async function getWeeklyReview() {
  const client = getRequiredSupabaseClient()

  const { data, error } = await client
    .from("weekly_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("Error fetching weekly review:", error)
    return null
  }

  return data
}

/**
 * Historial de revisiones
 */
export async function getWeeklyReviewHistory() {
  const client = getRequiredSupabaseClient()

  const { data, error } = await client
    .from("weekly_reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching weekly review history:", error)
    return []
  }

  return data
}
