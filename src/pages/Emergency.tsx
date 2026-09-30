import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HOSPITALS, LAUNCH_CITY } from "../data";
import { etaMinutes, formatKm, planDispatch, PING_RADIUS_KM, type Point } from "../logic";
import { useTitle } from "../ui";

type Phase = "idle" | "pinging" | "locked";

export function EmergencyPage() {
  useTitle("Emergency dispatch");
  const [origin, setOrigin] = useState<Point & { label: string }>({
    ...LAUNCH_CITY,
  });
  const [geoNote, setGeoNote] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const timer = useRef<number | null>(null);

  const plan = useMemo(() => planDispatch(origin, HOSPITALS), [origin]);
  const winner = plan.trauma.find((row) => row.hospital.id === plan.winnerId) ?? null;

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function reset(next: Point & { label: string }) {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setOrigin(next);
    setPhase("idle");
  }

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setGeoNote("This browser has no location service. Showing the Bangalore launch point.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        reset({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your location",
        });
        setGeoNote("Radius is drawn from your location. The hospital seed is still Bangalore.");
      },
      () => {
        setGeoNote("Location permission was declined. Showing Indiranagar, Bangalore.");
      },
    );
  }

  function ping() {
    if (!plan.ready || !winner) {
      setPhase("idle");
      return;
    }
    setPhase("pinging");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("locked"), winner.hospital.responseMs);
  }

  return (
    <>
      <div className="callout">
        <strong>Demo only.</strong> This handshake does not contact a hospital, send GPS, or book a bed. If you need emergency care, call <a href="tel:112">112</a>.
      </div>
      <p className="kicker">Dispatch protocol</p>
      <h1>Ping every ER inside 5 km. The first accept locks the request.</h1>
      <p className="lede">
        Directory ratings stay out of this path. From {origin.label}, asa.ai draws a {PING_RADIUS_KM} km radius, skips facilities with no trauma bay, and waits for three ER options before the ping can lock.
      </p>
      <div className="actions" style={{ marginBottom: 16 }}>
        <button type="button" className="button-secondary" onClick={() => reset({ ...LAUNCH_CITY })}>
          Indiranagar, Bangalore
        </button>
        <button type="button" className="button-secondary" onClick={useDeviceLocation}>
          Use my location
        </button>
      </div>
      {geoNote ? <p className="note">{geoNote}</p> : null}

      <section className="card">
        <div className="map-wrap">
          <RadiusMap origin={origin} rows={plan.inside} />
          <div>
            {plan.ready ? (
              <div className="callout ok">
                <strong>{plan.trauma.length} trauma ERs inside 5 km.</strong> The density gate is open for this point, so a ping can lock.
              </div>
            ) : (
              <div className="callout warn">
                <strong>
                  {plan.trauma.length} trauma ER{plan.trauma.length === 1 ? "" : "s"} inside 5 km.
                </strong>{" "}
                Dispatch stays off until a ping can reach 3 hospitals. Move the point back to Indiranagar to run the handshake.
              </div>
            )}
            <div className="actions">
              <button type="button" className="button-coral" onClick={ping} disabled={!plan.ready || phase === "pinging"}>
                {phase === "pinging" ? "Pinging ER systems…" : "Ping ERs within 5 km"}
              </button>
            </div>
            {phase === "locked" && winner ? (
              <p className="status" role="status">
                {winner.hospital.name} accepted first. Simulated lock. Trauma desk would receive live GPS from here. ETA about {etaMinutes(winner.km)} min over {formatKm(winner.km)}, {winner.hospital.beds} beds on the profile.
              </p>
            ) : null}
          </div>
        </div>
        <ul className="ping-list">
          {plan.inside.map((row, index) => {
            const state = pingState(phase, row.hospital.id, row.hospital.er, plan.winnerId);
            return (
              <li key={row.hospital.id} className="ping-row">
                <div>
                  <Link to={`/hospitals/${row.hospital.id}`}>
                    {index + 1}. {row.hospital.name}
                  </Link>
                  <p className="meta">
                    {formatKm(row.km)} · {row.hospital.erLabel} · {row.hospital.beds} beds
                  </p>
                </div>
                <span className={state.className}>{state.label}</span>
              </li>
            );
          })}
          {plan.outside.map((row) => (
            <li key={row.hospital.id} className="ping-row">
              <div>
                <Link to={`/hospitals/${row.hospital.id}`}>{row.hospital.name}</Link>
                <p className="meta">
                  {formatKm(row.km)} · {row.hospital.erLabel}
                </p>
              </div>
              <span className="tag idle">Outside 5 km</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function pingState(
  phase: Phase,
  id: string,
  er: boolean,
  winnerId: string | null,
): { label: string; className: string } {
  if (!er) return { label: "In radius, no ER system", className: "tag idle" };
  if (phase === "idle") return { label: "Ready to ping", className: "tag idle" };
  if (phase === "pinging") return { label: "Pinging", className: "tag wait" };
  if (id === winnerId) return { label: "Accept — request locks", className: "tag" };
  return { label: "Pinged, lock taken", className: "tag lock" };
}

function RadiusMap({
  origin,
  rows,
}: {
  origin: Point;
  rows: Array<{ hospital: { id: string; name: string; er: boolean }; km: number }>;
}) {
  const size = 320;
  const center = size / 2;
  const scale = (size * 0.38) / PING_RADIUS_KM;
  const kmEast = (lng: number) =>
    (lng - origin.lng) * 111 * Math.cos((origin.lat * Math.PI) / 180);
  const kmNorth = (lat: number) => (lat - origin.lat) * 111;

  return (
    <svg className="map" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Hospitals inside a 5 kilometer radius">
      <circle cx={center} cy={center} r={PING_RADIUS_KM * scale} fill="#e5f4f5" stroke="#0c7f8c" />
      <circle cx={center} cy={center} r={5} fill="#0c3d6e" />
      <text x={center + 8} y={center - 8} fontSize="11" fill="#0c3d6e">
        You
      </text>
      {rows.map((row, index) => {
        const hospital = HOSPITALS.find((item) => item.id === row.hospital.id);
        if (!hospital) return null;
        const x = center + kmEast(hospital.lng) * scale;
        const y = center - kmNorth(hospital.lat) * scale;
        return (
          <g key={hospital.id}>
            <circle cx={x} cy={y} r={7} fill={hospital.er ? "#0c7f8c" : "#8a5a12"}>
              <title>
                {index + 1}. {hospital.name}
              </title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
