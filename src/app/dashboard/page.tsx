"use client";

import { useEffect, useState } from "react";

type PrenotazioneOggi = {
  id_prenotazione: number;
  ospite_nome: string;
  ospite_cognome: string;
  camera_nome: string;
  data_checkin: string;
  data_checkout: string;
  numero_ospiti: number;
  stato: string;
};

type Camera = {
  id_camera: number;
  nome_numero: string;
  tipologia: string;
  stato: string;
};

type Kpi = {
  totale_camere: number;
  camere_occupate: number;
  camere_disponibili: number;
  camere_da_pulire: number;
  camere_manutenzione: number;
  tasso_occupazione: number;
  checkin_oggi: number;
  checkout_oggi: number;
  prenotazioni_7_giorni: number;
};

type DashboardData = {
  checkinOggi: PrenotazioneOggi[];
  checkoutOggi: PrenotazioneOggi[];
  camereDaPulire: Camera[];
  kpi: Kpi;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  // Formattazione data in italiano
  const oggi = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Funzione per ricaricare i dati della dashboard
  async function fetchDashboard() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  // Gestione stati di caricamento ed errore
  if (loading)
    return (
      <div className="container mt-4">
        <p>Caricamento dashboard...</p>
      </div>
    );
  if (!data)
    return (
      <div className="container mt-4">
        <p>Errore nel caricamento.</p>
      </div>
    );

  // Destrutturazione dei dati
  const { kpi, checkinOggi, checkoutOggi, camereDaPulire } = data;

  return (
    <div className="container-fluid mt-4">
      {/* Intestazione */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Dashboard</h1>
          <p className="text-secondary mb-0 text-capitalize">{oggi}</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={fetchDashboard}>
          ↻ Aggiorna
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 bg-primary text-white h-100">
            <div className="card-body">
              <p className="card-text small mb-1 opacity-75">
                Tasso occupazione
              </p>
              <h2 className="fw-bold mb-0">{kpi.tasso_occupazione}%</h2>
              <p className="small mt-1 mb-0 opacity-75">
                {kpi.camere_occupate} su {kpi.totale_camere} camere
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-success text-white h-100">
            <div className="card-body">
              <p className="card-text small mb-1 opacity-75">
                Camere disponibili
              </p>
              <h2 className="fw-bold mb-0">{kpi.camere_disponibili}</h2>
              <p className="small mt-1 mb-0 opacity-75">
                {kpi.camere_manutenzione} in manutenzione
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-warning text-dark h-100">
            <div className="card-body">
              <p className="card-text small mb-1 opacity-75">Movimenti oggi</p>
              <h2 className="fw-bold mb-0">
                {kpi.checkin_oggi + kpi.checkout_oggi}
              </h2>
              <p className="small mt-1 mb-0 opacity-75">
                {kpi.checkin_oggi} check-in · {kpi.checkout_oggi} check-out
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 bg-info text-dark h-100">
            <div className="card-body">
              <p className="card-text small mb-1 opacity-75">
                Prenotazioni (7 giorni)
              </p>
              <h2 className="fw-bold mb-0">{kpi.prenotazioni_7_giorni}</h2>
              <p className="small mt-1 mb-0 opacity-75">
                {kpi.camere_da_pulire} camere da pulire
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHECK-IN E CHECK-OUT DI OGGI */}
      <div className="row g-3 mb-4">
        {/* CHECK-IN */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Check-in oggi
                <span className="badge bg-primary ms-2">
                  {checkinOggi.length}
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {checkinOggi.length === 0 ? (
                <p className="text-muted p-3 mb-0">
                  Nessun check-in previsto oggi.
                </p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ospite</th>
                      <th>Camera</th>
                      <th>Ospiti</th>
                      <th>Checkout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkinOggi.map((p) => (
                      <tr key={p.id_prenotazione}>
                        <td>
                          {p.ospite_cognome} {p.ospite_nome}
                        </td>
                        <td>{p.camera_nome}</td>
                        <td>{p.numero_ospiti}</td>
                        <td>{p.data_checkout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* CHECK-OUT */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Check-out oggi
                <span className="badge bg-success ms-2">
                  {checkoutOggi.length}
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {checkoutOggi.length === 0 ? (
                <p className="text-muted p-3 mb-0">
                  Nessun check-out previsto oggi.
                </p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ospite</th>
                      <th>Camera</th>
                      <th>Check-in</th>
                      <th>Notti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkoutOggi.map((p) => (
                      <tr key={p.id_prenotazione}>
                        <td>
                          {p.ospite_cognome} {p.ospite_nome}
                        </td>
                        <td>{p.camera_nome}</td>
                        <td>{p.data_checkin}</td>
                        <td>
                          {Math.ceil(
                            (new Date(p.data_checkout).getTime() -
                              new Date(p.data_checkin).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CAMERE DA PULIRE */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            Camere da pulire
            <span className="badge bg-warning text-dark ms-2">
              {camereDaPulire.length}
            </span>
          </h5>
        </div>
        <div className="card-body p-0">
          {camereDaPulire.length === 0 ? (
            <p className="text-muted p-3 mb-0">
              Tutte le camere sono pulite. ✓
            </p>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Camera</th>
                  <th>Tipologia</th>
                  <th>Capienza</th>
                </tr>
              </thead>
              <tbody>
                {camereDaPulire.map((c) => (
                  <tr key={c.id_camera}>
                    <td>{c.nome_numero}</td>
                    <td>{c.tipologia}</td>
                    <td>{c.stato}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
