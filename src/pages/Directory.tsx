import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AFFILIATIONS, DOCTORS, HOSPITALS, hospitalById } from "../data";
import { useReviews } from "../store";
import { Score, useTitle } from "../ui";

const FILTERS = ["All", "Cardiology", "Pediatrics"] as const;

export function DirectoryPage() {
  useTitle("Bangalore directory");
  const { ratingFor } = useReviews();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<(typeof FILTERS)[number]>("All");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DOCTORS.filter((doctor) => {
      if (specialty !== "All" && doctor.specialty !== specialty) return false;
      if (!needle) return true;
      const sites = AFFILIATIONS.filter((row) => row.doctorId === doctor.id)
        .map((row) => hospitalById(row.hospitalId))
        .filter((hospital) => hospital !== undefined);
      const haystack = [
        doctor.name,
        doctor.specialty,
        doctor.focus,
        ...sites.flatMap((hospital) => [hospital.name, hospital.area]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    }).sort((a, b) => b.rating - a.rating);
  }, [query, specialty]);

  return (
    <>
      <p className="kicker">Launch city · Bangalore</p>
      <h1>Find a doctor, then see each hospital on its own rating.</h1>
      <p className="lede">
        A doctor is not stored under a hospital. Search loads the doctor profile, joins the places they practice, and puts that hospital’s rating beside the schedule. Cardiology and pediatrics are the open specialties.
      </p>
      <label className="search">
        <span>Search doctors, specialties, or hospitals</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try Menon, cardiology, or Cloudnine"
        />
      </label>
      <div className="chips" role="group" aria-label="Specialty">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === specialty ? "chip on" : "chip"}
            onClick={() => setSpecialty(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="stack">
        {results.map((doctor) => {
          const rating = ratingFor("doctor", doctor.id, doctor.rating, doctor.reviewCount);
          const sites = AFFILIATIONS.filter((row) => row.doctorId === doctor.id);
          return (
            <article key={doctor.id} className="card">
              <div className="result-head">
                <div>
                  <Link className="result-name" to={`/doctors/${doctor.id}`}>
                    {doctor.name}
                  </Link>
                  <p className="meta">
                    {doctor.specialty} · License {doctor.license}
                  </p>
                </div>
                <Score value={rating.value} precise={rating.precise} label="Doctor" />
              </div>
              <ul className="sites">
                {sites.map((site) => {
                  const hospital = hospitalById(site.hospitalId);
                  if (!hospital) return null;
                  const hospitalRating = ratingFor(
                    "hospital",
                    hospital.id,
                    hospital.rating,
                    hospital.reviewCount,
                  );
                  return (
                    <li key={site.hospitalId} className="site">
                      <div>
                        <Link className="text-link" to={`/hospitals/${hospital.id}`}>
                          {hospital.name}
                        </Link>
                        <p>{site.schedule}</p>
                      </div>
                      <Score
                        small
                        value={hospitalRating.value}
                        precise={hospitalRating.precise}
                        label="Hospital"
                      />
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
        {results.length === 0 ? (
          <p className="note">No doctor in this Bangalore seed matches that search.</p>
        ) : null}
      </div>
      <p className="note">{HOSPITALS.length} hospitals in the seed. Ratings on each profile stay separate from the schedule.</p>
    </>
  );
}
