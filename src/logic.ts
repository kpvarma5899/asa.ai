import type { Badge, Hospital, Review } from "./data";

export const PING_RADIUS_KM = 5;
export const MIN_ER_OPTIONS = 3;

const DOCTOR_WORDS =
  /\b(doctor|dr|physician|pediatrician|cardiologist|surgeon|consultation|bedside)\b/i;
const PERSON_WORDS =
  /\b(brilliant|rude|kind|gentle|arrogant|listened|explained|rushed|caring)\b/i;
const HOSPITAL_WORDS =
  /\b(ward|hospital|nurse|nurses|clean|dirty|filthy|beds?|wait(?:ed|ing)?|staff|facility|billing|hygiene|room|hall|overcrowd\w*|reception|desk)\b/i;
const POSITIVE =
  /\b(brilliant|excellent|great|caring|clean|kind|thorough|wonderful|gentle|professional|clearly|listened|amazing|good)\b/gi;
const NEGATIVE =
  /\b(dirty|rude|rushed|slow|filthy|overcrowded|worst|poor|awful|terrible|delay|uncaring|bad)\b/gi;

export type Point = { lat: number; lng: number };

export type Split = {
  doctorClauses: string[];
  hospitalClauses: string[];
  doctorScore: number | null;
  hospitalScore: number | null;
};

export type Rated = {
  value: number;
  count: number;
};

export type PingTarget = {
  hospital: Hospital;
  km: number;
};

export type DispatchPlan = {
  inside: PingTarget[];
  outside: PingTarget[];
  trauma: PingTarget[];
  ready: boolean;
  winnerId: string | null;
};

export function distanceKm(a: Point, b: Point): number {
  const radius = 6371;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function etaMinutes(km: number): number {
  return Math.max(4, Math.round((km / 22) * 60 + 3));
}

function clauses(text: string): string[] {
  return text
    .split(/\s*(?:\bbut\b|\bhowever\b|\balthough\b|\bthough\b|[.;!?])\s*/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function classify(clause: string): "doctor" | "hospital" | "both" | "unclear" {
  const doctor = DOCTOR_WORDS.test(clause) || PERSON_WORDS.test(clause);
  const hospital = HOSPITAL_WORDS.test(clause);
  if (doctor && hospital) return "both";
  if (doctor) return "doctor";
  if (hospital) return "hospital";
  return "unclear";
}

function countMatches(pattern: RegExp, text: string): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return text.match(new RegExp(pattern.source, flags))?.length ?? 0;
}

export function sentiment(text: string): number {
  const positive = countMatches(POSITIVE, text);
  const negative = countMatches(NEGATIVE, text);
  if (positive + negative === 0) return 0;
  return Math.max(-1, Math.min(1, (positive - negative) / (positive + negative)));
}

function placeClause(clause: string, doctorClauses: string[], hospitalClauses: string[]) {
  const kind = classify(clause);
  if (kind === "both") {
    const finer = clause
      .split(/\s*(?:,|\band\b)\s*/i)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (finer.length > 1) {
      let placed = false;
      for (const bit of finer) {
        const bitKind = classify(bit);
        if (bitKind === "doctor") {
          doctorClauses.push(bit);
          placed = true;
        } else if (bitKind === "hospital") {
          hospitalClauses.push(bit);
          placed = true;
        } else if (bitKind === "both") {
          doctorClauses.push(bit);
          hospitalClauses.push(bit);
          placed = true;
        }
      }
      if (placed) return;
    }
    doctorClauses.push(clause);
    hospitalClauses.push(clause);
    return;
  }
  if (kind === "doctor") doctorClauses.push(clause);
  if (kind === "hospital") hospitalClauses.push(clause);
}

export function splitReview(text: string): Split {
  const doctorClauses: string[] = [];
  const hospitalClauses: string[] = [];
  for (const clause of clauses(text)) {
    placeClause(clause, doctorClauses, hospitalClauses);
  }
  return {
    doctorClauses,
    hospitalClauses,
    doctorScore: doctorClauses.length ? sentiment(doctorClauses.join(" ")) : null,
    hospitalScore: hospitalClauses.length ? sentiment(hospitalClauses.join(" ")) : null,
  };
}

export const BADGE_WEIGHT: Record<Badge, number> = {
  "100% Verified": 1,
  "Verified Patient": 0.75,
  Unverified: 0.35,
};

export function blendRating(
  base: number,
  baseCount: number,
  adjustments: Array<{ score: number; weight: number }>,
): Rated {
  const baseWeight = Math.max(baseCount, 0);
  const extraWeight = adjustments.reduce((sum, item) => sum + item.weight, 0);
  const extraSum = adjustments.reduce(
    (sum, item) => sum + (3 + item.score * 2) * item.weight,
    0,
  );
  const total = baseWeight + extraWeight;
  const value = total === 0 ? base : (base * baseWeight + extraSum) / total;
  const clamped = Math.min(5, Math.max(1, value));
  return {
    value: Math.round(clamped * 100) / 100,
    count: Math.round(baseCount + extraWeight),
  };
}

export function adjustmentsFor(
  reviews: Review[],
  side: "doctor" | "hospital",
  id: string,
): Array<{ score: number; weight: number }> {
  const rows: Array<{ score: number; weight: number }> = [];
  for (const review of reviews) {
    if (side === "doctor" && review.doctorId !== id) continue;
    if (side === "hospital" && review.hospitalId !== id) continue;
    const split = splitReview(review.text);
    const score = side === "doctor" ? split.doctorScore : split.hospitalScore;
    if (score === null) continue;
    rows.push({ score, weight: BADGE_WEIGHT[review.badge] });
  }
  return rows;
}

export function planDispatch(origin: Point, hospitals: Hospital[]): DispatchPlan {
  const ranked = hospitals
    .map((hospital) => ({
      hospital,
      km: distanceKm(origin, hospital),
    }))
    .sort((a, b) => a.km - b.km);
  const inside = ranked.filter((row) => row.km <= PING_RADIUS_KM);
  const outside = ranked.filter((row) => row.km > PING_RADIUS_KM);
  const trauma = inside.filter((row) => row.hospital.er);
  const ready = trauma.length >= MIN_ER_OPTIONS;
  const winner = ready
    ? trauma.reduce((best, row) =>
        row.hospital.responseMs < best.hospital.responseMs ? row : best,
      )
    : null;
  return {
    inside,
    outside,
    trauma,
    ready,
    winnerId: winner?.hospital.id ?? null,
  };
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatRating(value: number, precise: boolean): string {
  return precise ? value.toFixed(2) : value.toFixed(1);
}

export function scoreLabel(score: number | null): string {
  if (score === null) return "No clause";
  if (score > 0.2) return "Positive";
  if (score < -0.2) return "Negative";
  return "Mixed";
}
