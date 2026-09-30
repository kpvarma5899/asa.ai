import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  affiliationsForDoctor,
  doctorById,
  hospitalById,
  type Badge,
  type Review,
} from "../data";
import { adjustmentsFor, blendRating, scoreLabel, splitReview } from "../logic";
import { useReviews } from "../store";
import { BadgeView, Score, useTitle } from "../ui";

export function DoctorPage() {
  const { id = "" } = useParams();
  const doctor = doctorById(id);
  useTitle(doctor?.name ?? "Doctor");
  const { reviews, localReviews, addReview, ratingFor } = useReviews();
  const fileRef = useRef<HTMLInputElement>(null);
  const sites = affiliationsForDoctor(id);
  const [hospitalId, setHospitalId] = useState(sites[0]?.hospitalId ?? "");
  const [badge, setBadge] = useState<Badge>("100% Verified");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [saved, setSaved] = useState("");

  const split = useMemo(() => splitReview(text), [text]);
  const ownReviews = reviews.filter((review) => review.doctorId === id);

  if (!doctor) {
    return (
      <>
        <Link className="back" to="/">
          Back to directory
        </Link>
        <h1>That doctor is not in the Bangalore seed.</h1>
      </>
    );
  }

  const profile = doctor;
  const rating = ratingFor("doctor", profile.id, profile.rating, profile.reviewCount);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const note = text.trim();
    if (note.length < 8 || !hospitalId) return;
    if (badge === "Verified Patient" && !fileName) return;
    const review: Review = {
      id: crypto.randomUUID(),
      doctorId: profile.id,
      hospitalId,
      text: note,
      badge,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const upcoming = [...localReviews, review];
    const nextDoctor = blendRating(
      profile.rating,
      profile.reviewCount,
      adjustmentsFor(upcoming, "doctor", profile.id),
    );
    const hospital = hospitalById(hospitalId);
    const nextHospital = hospital
      ? blendRating(
          hospital.rating,
          hospital.reviewCount,
          adjustmentsFor(upcoming, "hospital", hospital.id),
        )
      : null;
    addReview(review);
    setSaved(
      nextHospital && hospital
        ? `Saved on this device. Doctor rating ${nextDoctor.value.toFixed(2)}. ${hospital.name} rating ${nextHospital.value.toFixed(2)}.`
        : "Saved on this device.",
    );
    setText("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <Link className="back" to="/">
        Back to directory
      </Link>
      <div className="profile-head">
        <div>
          <p className="kicker">{doctor.specialty}</p>
          <h1>{doctor.name}</h1>
          <p className="lede">
            {doctor.focus}. Medical license {doctor.license}, marked verified in this seed.
          </p>
        </div>
        <Score value={rating.value} precise={rating.precise} label="Doctor rating" />
      </div>

      <div className="profile-grid">
        <section className="card">
          <h2>Where they practice</h2>
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
                    <Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link>
                    <p>
                      {site.schedule} · {hospital.erLabel} · {hospital.beds} beds
                    </p>
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
        </section>

        <section className="card">
          <h2>Write a visit note</h2>
          <p className="note">
            Partner discharges are tagged 100% Verified. A bill upload is tagged Verified Patient. The note is split so the doctor and the hospital do not share one score.
          </p>
          <form onSubmit={onSubmit}>
            <label className="field">
              <span>Hospital for this visit</span>
              <select value={hospitalId} onChange={(event) => setHospitalId(event.target.value)}>
                {sites.map((site) => {
                  const hospital = hospitalById(site.hospitalId);
                  return (
                    <option key={site.hospitalId} value={site.hospitalId}>
                      {hospital?.name}
                    </option>
                  );
                })}
              </select>
            </label>
            <fieldset className="choice">
              <legend>How this visit is checked</legend>
              <label>
                <input
                  type="radio"
                  name="badge"
                  checked={badge === "100% Verified"}
                  onChange={() => setBadge("100% Verified")}
                />
                <span>Hospital discharge event · 100% Verified. Stands in for an HL7/FHIR trigger.</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="badge"
                  checked={badge === "Verified Patient"}
                  onChange={() => setBadge("Verified Patient")}
                />
                <span>Upload a bill or discharge summary · Verified Patient.</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="badge"
                  checked={badge === "Unverified"}
                  onChange={() => setBadge("Unverified")}
                />
                <span>Written from memory · Unverified, lower weight.</span>
              </label>
            </fieldset>
            {badge === "Verified Patient" ? (
              <label className="field">
                <span>Bill or summary</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
                />
                <span className="note">
                  {fileName
                    ? `Attached ${fileName}. The file stays on this device. Recorded doctor ${doctor.name}, hospital ${hospitalById(hospitalId)?.name ?? ""}, date ${new Date().toISOString().slice(0, 10)}.`
                    : "Production runs OCR for the doctor, hospital, and date. This MVP keeps the file local and records those three fields from this page."}
                </span>
              </label>
            ) : null}
            <label className="field">
              <span>What happened</span>
              <textarea
                rows={4}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="The doctor was brilliant but the ward was dirty."
              />
            </label>
            {text.trim() ? (
              <div className="two" style={{ marginBottom: 12 }}>
                <ClauseBox title="Doctor" clauses={split.doctorClauses} score={split.doctorScore} />
                <ClauseBox title="Hospital" clauses={split.hospitalClauses} score={split.hospitalScore} />
              </div>
            ) : null}
            <div className="actions">
              <button className="button" type="submit">
                Save note
              </button>
            </div>
            {saved ? <p className="status">{saved}</p> : null}
          </form>
        </section>
      </div>

      <section style={{ marginTop: 22 }}>
        <h2>Notes</h2>
        {ownReviews.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </section>
    </>
  );
}

function ClauseBox({
  title,
  clauses,
  score,
}: {
  title: string;
  clauses: string[];
  score: number | null;
}) {
  return (
    <div>
      <p className="kicker">
        {title} · {scoreLabel(score)}
      </p>
      <ul className="clauses">
        {clauses.length === 0 ? <li>Nothing in this note maps here.</li> : null}
        {clauses.map((clause) => (
          <li key={clause}>{clause}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const hospital = hospitalById(review.hospitalId);
  const split = splitReview(review.text);
  return (
    <article className="review">
      <div className="review-top">
        <BadgeView badge={review.badge} />
        <span className="meta">
          {review.createdAt}
          {hospital ? ` · ${hospital.name}` : ""}
        </span>
      </div>
      <p>{review.text}</p>
      <ul className="clauses">
        {split.doctorClauses.map((clause) => (
          <li key={`d-${clause}`}>
            <b>Doctor · {scoreLabel(split.doctorScore)}.</b> {clause}
          </li>
        ))}
        {split.hospitalClauses.map((clause) => (
          <li key={`h-${clause}`}>
            <b>Hospital · {scoreLabel(split.hospitalScore)}.</b> {clause}
          </li>
        ))}
      </ul>
    </article>
  );
}
