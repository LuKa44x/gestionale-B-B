"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// voci di menu per la navbar, con href e label
const voci = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prenotazioni", label: "Prenotazioni" },
  { href: "/camere", label: "Camere" },
  { href: "/ospiti", label: "Ospiti" },
  { href: "/personale", label: "Personale" },
  { href: "/servizi-extra", label: "Servizi Extra" },
  { href: "/tariffe-stagionali", label: "Tariffe Stagionali" },
  { href: "/sconti", label: "Sconti" },
  { href: "/cassa", label: "Cassa" },
  { href: "/report", label: "Report" },
];

export default function Navbar() {
  // ottengo il pathname corrente per evidenziare la voce attiva
  const pathname = usePathname();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link href="/dashboard" className="navbar-brand fw-bold">
          🏨 Gestionale B&B
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {voci.map((voce) => (
              <li key={voce.href} className="nav-item">
                <Link
                  href={voce.href}
                  className={`nav-link ${pathname === voce.href ? "active" : ""}`}
                >
                  {voce.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
