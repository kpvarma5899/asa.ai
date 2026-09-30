import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SEED_REVIEWS, type Review } from "./data";
import { adjustmentsFor, blendRating, type Rated } from "./logic";

const STORAGE_KEY = "asa.reviews.v1";

type Store = {
  reviews: Review[];
  localReviews: Review[];
  addReview: (review: Review) => void;
  ratingFor: (
    side: "doctor" | "hospital",
    id: string,
    base: number,
    baseCount: number,
  ) => Rated & { precise: boolean };
};

const ReviewsContext = createContext<Store | null>(null);

function readStored(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ReviewStore({ children }: { children: ReactNode }) {
  const [localReviews, setLocalReviews] = useState<Review[]>(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localReviews));
  }, [localReviews]);

  const reviews = useMemo(
    () => [...localReviews].reverse().concat(SEED_REVIEWS),
    [localReviews],
  );

  const value = useMemo<Store>(
    () => ({
      reviews,
      localReviews,
      addReview: (review) => setLocalReviews((current) => [...current, review]),
      ratingFor: (side, id, base, baseCount) => {
        const adjustments = adjustmentsFor(localReviews, side, id);
        const rated = blendRating(base, baseCount, adjustments);
        return { ...rated, precise: adjustments.length > 0 };
      },
    }),
    [localReviews, reviews],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews(): Store {
  const store = useContext(ReviewsContext);
  if (!store) throw new Error("useReviews must be used inside ReviewStore");
  return store;
}
