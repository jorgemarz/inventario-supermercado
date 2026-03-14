import { sampleCurrentWeekReview, sampleProducts } from "@/lib/sample-data";
import { WeeklyReviewItem } from "@/lib/types";

const CURRENT_WEEK_REVIEW_STORAGE_KEY = "despensa-weekly:current-review";

function getFallbackReview(): WeeklyReviewItem[] {
  return sampleProducts
    .filter((product) => product.active)
    .map((product) => {
      const sampleReview = sampleCurrentWeekReview.find((item) => item.product_id === product.id);
      return (
        sampleReview ?? {
          product_id: product.id,
          status: "not_needed",
          suggested_quantity: 0
        }
      );
    });
}

export function loadCurrentWeekReview(): WeeklyReviewItem[] {
  const fallbackReview = getFallbackReview();

  if (typeof window === "undefined") {
    return fallbackReview;
  }

  try {
    const rawReview = window.localStorage.getItem(CURRENT_WEEK_REVIEW_STORAGE_KEY);
    if (!rawReview) {
      return fallbackReview;
    }

    const parsedReview = JSON.parse(rawReview);
    if (!Array.isArray(parsedReview)) {
      return fallbackReview;
    }

    const persistedById = new Map(
      parsedReview
        .filter(
          (item): item is WeeklyReviewItem =>
            Boolean(item) &&
            typeof item.product_id === "string" &&
            ["needed", "almost_finished", "not_needed"].includes(item.status) &&
            typeof item.suggested_quantity === "number"
        )
        .map((item) => [item.product_id, item])
    );

    return fallbackReview.map((item) => persistedById.get(item.product_id) ?? item);
  } catch {
    return fallbackReview;
  }
}

export function saveCurrentWeekReview(review: WeeklyReviewItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRENT_WEEK_REVIEW_STORAGE_KEY, JSON.stringify(review));
}
