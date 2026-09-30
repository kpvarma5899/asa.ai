import { describe, expect, test } from "bun:test";
import { HOSPITALS, LAUNCH_CITY } from "./data";
import {
  MIN_ER_OPTIONS,
  PING_RADIUS_KM,
  blendRating,
  distanceKm,
  planDispatch,
  splitReview,
} from "./logic";

describe("directory geometry", () => {
  test("launch city can see three trauma ERs inside 5 km", () => {
    const plan = planDispatch(LAUNCH_CITY, HOSPITALS);
    expect(plan.trauma.length).toBe(MIN_ER_OPTIONS);
    expect(plan.ready).toBe(true);
    expect(plan.winnerId).toBe("manipal-oar");
    expect(plan.inside.some((row) => row.hospital.id === "cloudnine-oar" && !row.hospital.er)).toBe(
      true,
    );
    const apollo = plan.outside.find((row) => row.hospital.id === "apollo-bannerghatta");
    expect(apollo).toBeDefined();
    expect(apollo!.km).toBeGreaterThan(PING_RADIUS_KM);
  });

  test("Manipal sits about 2.4 km from Indiranagar", () => {
    const manipal = HOSPITALS.find((hospital) => hospital.id === "manipal-oar")!;
    const km = distanceKm(LAUNCH_CITY, manipal);
    expect(km).toBeGreaterThan(2.2);
    expect(km).toBeLessThan(2.6);
  });
});

describe("sentiment split", () => {
  test("attributes brilliance to the doctor and the ward to the hospital", () => {
    const split = splitReview("The doctor was brilliant but the ward was dirty.");
    expect(split.doctorClauses).toEqual(["The doctor was brilliant"]);
    expect(split.hospitalClauses).toEqual(["the ward was dirty"]);
    expect(split.doctorScore).toBe(1);
    expect(split.hospitalScore).toBe(-1);
  });

  test("splits a gentle doctor from a clean room", () => {
    const split = splitReview("Very gentle with my son and the room was clean.");
    expect(split.doctorClauses).toEqual(["Very gentle with my son"]);
    expect(split.hospitalClauses).toEqual(["the room was clean"]);
    expect(split.doctorScore).toBe(1);
    expect(split.hospitalScore).toBe(1);
  });

  test("splits listening from an overcrowded hall", () => {
    const split = splitReview("She listened. The waiting hall was overcrowded.");
    expect(split.doctorClauses).toEqual(["She listened"]);
    expect(split.hospitalClauses).toEqual(["The waiting hall was overcrowded"]);
    expect(split.doctorScore).toBe(1);
    expect(split.hospitalScore).toBe(-1);
  });
});

describe("rating blend", () => {
  test("a verified dirty-ward review pulls the hospital score down", () => {
    const blended = blendRating(4.2, 410, [{ score: -1, weight: 1 }]);
    expect(blended.value).toBeLessThan(4.2);
    expect(blended.value).toBeGreaterThan(4.1);
  });
});
