import { Link, useParams } from "react-router-dom";
import {
  affiliationsForHospital,
  doctorById,
  hospitalById,
} from "../data";
import { splitReview } from "../logic";
import { useReviews } from "../store";
import { BadgeView, Score, useTitle } from "../ui";

export function HospitalPage() {
  const { id = "" } = useParams();
  const hospital = hospitalById(id);
  useTitle(hospital?.name ?? "Hospital");
  const { reviews, ratingFor } = useReviews();

  if (!hospital) {
    return (
      <>
        <Link className="back" to="/">
          Back to directory
        </Link>
        <h1>That hospital is not in the Bangalore seed.</h1>
      </>
    );
  }

  const rating = ratingFor("hospital", hospital.id, hospital.rating, hospital.reviewCount);
  const doctors = affiliationsForHospital(hospital.id);
  const notes = reviews.filter((review) => {
    if (review.hospitalId !== hospital.id) return false;
    return splitReview(review.text).hospitalClauses.length > 0;
  });

  return (
    <>
      <Link className="back" to="/">
        Back to directory
      </Link>
      <div className="profile-head">
        <div>
          <p className="kicker">{hospital.area}</p>
          <h1>{hospital.name}</h1>
          <p className="lede">
            {hospital.beds} beds · {hospital.erLabel}. The hospital rating stands on its own, separate from every doctor who holds a clinic here.
          </p>
        </div>
        <Score value={rating.value} precise={rating.precise} label="Hospital rating" />
      </div>
      <div className="profile-grid">
        <section className="card">
          <h2>Affiliated doctors</h2>
          <ul className="sites">
            {doctors.map((row) => {
              const doctor = doctorById(row.doctorId);
              if (!doctor) return null;
              const doctorRating = ratingFor("doctor", doctor.id, doctor.rating, doctor.reviewCount);
              return (
                <li key={row.doctorId} className="site">
                  <div>
                    <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
                    <p>
                      {doctor.specialty} · {row.schedule}
                    </p>
                  </div>
                  <Score small value={doctorRating.value} precise={doctorRating.precise} label="Doctor" />
                </li>
              );
            })}
          </ul>
        </section>
        <section className="card">
          <h2>Facility notes</h2>
          <p className="note">Only the clauses attributed to the building show up here.</p>
          {notes.length === 0 ? <p className="note">No facility clauses yet.</p> : null}
          {notes.map((review) => {
            const split = splitReview(review.text);
            const doctor = doctorById(review.doctorId);
            return (
              <article key={review.id} className="review">
                <div className="review-top">
                  <BadgeView badge={review.badge} />
                  <span className="meta">{doctor?.name}</span>
                </div>
                {split.hospitalClauses.map((clause) => (
                  <p key={clause}>{clause}</p>
                ))}
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}
