"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Utente = {
  nome: string;
  cognome: string;
  ruolo: string;
};

const vociTutte = [
  {
    href: "/dashboard",
    label: "Dashboard",
    ruoli: ["Reception", "Manager", "Housekeeping"],
  },
  {
    href: "/prenotazioni",
    label: "Prenotazioni",
    ruoli: ["Reception", "Manager"],
  },
  {
    href: "/camere",
    label: "Camere",
    ruoli: ["Reception", "Manager", "Housekeeping"],
  },
  { href: "/ospiti", label: "Ospiti", ruoli: ["Reception", "Manager"] },
  { href: "/cassa", label: "Cassa", ruoli: ["Reception", "Manager"] },
  { href: "/servizi-extra", label: "Servizi Extra", ruoli: ["Manager"] },
  {
    href: "/tariffe-stagionali",
    label: "Tariffe Stagionali",
    ruoli: ["Manager"],
  },
  { href: "/sconti", label: "Sconti", ruoli: ["Manager"] },
  { href: "/personale", label: "Personale", ruoli: ["Manager"] },
  { href: "/report", label: "Report", ruoli: ["Manager"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [utente, setUtente] = useState<Utente | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUtente(data))
      .catch(() => setUtente(null));
  }, [pathname]);

  // Non mostrare la navbar sulla pagina di login
  if (pathname === "/login") return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const voci = utente
    ? vociTutte.filter((v) => v.ruoli.includes(utente.ruolo))
    : [];

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

          {utente && (
            <div className="d-flex align-items-center gap-3">
              <span className="text-white-50 small">
                {utente.nome} {utente.cognome}
                <span className="badge bg-secondary ms-2">{utente.ruolo}</span>
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
