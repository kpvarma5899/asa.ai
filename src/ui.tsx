import { useEffect, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Badge } from "./data";
import { formatRating } from "./logic";

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · asa.ai`;
  }, [title]);
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="brand">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="asa.ai — AI Healthcare Network and Emergency Response"
          />
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Directory
          </NavLink>
          <NavLink to="/emergency" className="emergency-link">
            Emergency
          </NavLink>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">
        Sample Bangalore network for the asa.ai MVP. Profiles, ratings, and the dispatch handshake are illustrative. This app does not contact hospitals. In a real emergency call <strong>112</strong>.
      </footer>
    </div>
  );
}

export function Score({
  value,
  label,
  precise = false,
  small = false,
}: {
  value: number;
  label: string;
  precise?: boolean;
  small?: boolean;
}) {
  return (
    <div className={small ? "score small" : "score"}>
      <strong>{formatRating(value, precise)}</strong>
      <span>{label}</span>
    </div>
  );
}

export function BadgeView({ badge }: { badge: Badge }) {
  return <span className={badge === "Unverified" ? "badge plain" : "badge"}>{badge}</span>;
}
