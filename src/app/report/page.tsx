"use client";

import { useState } from "react";

type PrenotazioneReport = {
  id_prenotazione: number;
  ospite_nome: string;
  ospite_cognome: string;
  camera_nome: string;
  data_checkin: string;
  data_checkout: string;
  notti: number;
  stato: string;
  canale: string;
  importo_camera: string;
  importo_servizi: string;
  totale: string;
};

type RiepilogoPrenotazioni = {
  num_prenotazioni: number;
  totale_notti: number;
  totale_importo: number;
};

type KpiOccupazione = {
  tasso_occupazione: number;
  adr: number;
  revpar: number;
  num_prenotazioni: number;
  notti_vendute: number;
  notti_disponibili: number;
  ricavi_camere: number;
  ricavi_servizi: number;
  ricavi_totali: number;
  totale_camere: number;
};

type Canale = {
  canale: string;
  num_prenotazioni: number;
  notti: number;
  ricavi: string;
};

// Data di default (inizio anno corrente)
const inizioAnno = `${new Date().getFullYear()}-01-01`;
const oggi = new Date().toISOString().split("T")[0];

export default function ReportPage() {
  const [tabAttiva, setTabAttiva] = useState<"prenotazioni" | "occupazione">(
    "prenotazioni",
  );
  const [da, setDa] = useState(inizioAnno);
  const [a, setA] = useState(oggi);
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroCanale, setFiltroCanale] = useState("");
  const [loading, setLoading] = useState(false);

  // Dati prenotazioni
  const [prenotazioni, setPrenotazioni] = useState<PrenotazioneReport[]>([]);
  const [riepilogo, setRiepilogo] = useState<RiepilogoPrenotazioni | null>(
    null,
  );

  // Dati occupazione
  const [kpi, setKpi] = useState<KpiOccupazione | null>(null);
  const [canali, setCanali] = useState<Canale[]>([]);

  // Funzione per generare il report in base alla tab attiva e ai filtri
  async function generaReport() {
    setLoading(true);
    try {
      if (tabAttiva === "prenotazioni") {
        let url = `/api/report/prenotazioni?da=${da}&a=${a}`;
        if (filtroStato) url += `&stato=${encodeURIComponent(filtroStato)}`;
        if (filtroCanale) url += `&canale=${encodeURIComponent(filtroCanale)}`;
        const res = await fetch(url);
        const data = await res.json();
        setPrenotazioni(data.prenotazioni);
        setRiepilogo(data.riepilogo);
      } else {
        const res = await fetch(`/api/report/occupazione?da=${da}&a=${a}`);
        const data = await res.json();
        setKpi(data.kpi);
        setCanali(data.canali);
      }
    } finally {
      setLoading(false);
    }
  }

  const badgeStato: Record<string, string> = {
    Confermata: "bg-primary",
    "Check-in effettuato": "bg-warning text-dark",
    "Check-out effettuato": "bg-success",
    Annullata: "bg-danger",
    "No-show": "bg-secondary",
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Report</h1>

      {/* FILTRI */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Dal</label>
              <input
                type="date"
                className="form-control"
                value={da}
                onChange={(e) => setDa(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Al</label>
              <input
                type="date"
                className="form-control"
                value={a}
                onChange={(e) => setA(e.target.value)}
              />
            </div>

            {tabAttiva === "prenotazioni" && (
              <>
                <div className="col-md-2">
                  <label className="form-label">Stato</label>
                  <select
                    className="form-select"
                    value={filtroStato}
                    onChange={(e) => setFiltroStato(e.target.value)}
                  >
                    <option value="">Tutti</option>
                    <option>Confermata</option>
                    <option>Check-in effettuato</option>
                    <option>Check-out effettuato</option>
                    <option>Annullata</option>
                    <option>No-show</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Canale</label>
                  <select
                    className="form-select"
                    value={filtroCanale}
                    onChange={(e) => setFiltroCanale(e.target.value)}
                  >
                    <option value="">Tutti</option>
                    <option>Diretto</option>
                    <option>Booking</option>
                    <option>Airbnb</option>
                    <option>Expedia</option>
                    <option>Altro</option>
                  </select>
                </div>
              </>
            )}

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={generaReport}
                disabled={loading}
              >
                {loading ? "Caricamento..." : "Genera Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tabAttiva === "prenotazioni" ? "active" : ""}`}
            onClick={() => {
              setTabAttiva("prenotazioni");
              setPrenotazioni([]);
              setRiepilogo(null);
            }}
          >
            Prenotazioni
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tabAttiva === "occupazione" ? "active" : ""}`}
            onClick={() => {
              setTabAttiva("occupazione");
              setKpi(null);
              setCanali([]);
            }}
          >
            Occupazione e Ricavi
          </button>
        </li>
      </ul>

      {/* === TAB PRENOTAZIONI === */}
      {tabAttiva === "prenotazioni" && (
        <>
          {riepilogo && (
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card text-center border-primary">
                  <div className="card-body">
                    <h3 className="text-primary">
                      {riepilogo.num_prenotazioni}
                    </h3>
                    <p className="mb-0 text-muted">Prenotazioni</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center border-success">
                  <div className="card-body">
                    <h3 className="text-success">{riepilogo.totale_notti}</h3>
                    <p className="mb-0 text-muted">Notti totali</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center border-warning">
                  <div className="card-body">
                    <h3 className="text-warning">
                      € {riepilogo.totale_importo.toFixed(2)}
                    </h3>
                    <p className="mb-0 text-muted">Importo totale stimato</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {prenotazioni.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped table-hover table-sm">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Ospite</th>
                    <th>Camera</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Notti</th>
                    <th>Stato</th>
                    <th>Canale</th>
                    <th>Camera €</th>
                    <th>Servizi €</th>
                    <th>Totale €</th>
                  </tr>
                </thead>
                <tbody>
                  {prenotazioni.map((p) => (
                    <tr key={p.id_prenotazione}>
                      <td>#{p.id_prenotazione}</td>
                      <td>
                        {p.ospite_cognome} {p.ospite_nome}
                      </td>
                      <td>{p.camera_nome}</td>
                      <td>{p.data_checkin}</td>
                      <td>{p.data_checkout}</td>
                      <td>{p.notti}</td>
                      <td>
                        <span
                          className={`badge ${badgeStato[p.stato] || "bg-secondary"}`}
                        >
                          {p.stato}
                        </span>
                      </td>
                      <td>{p.canale}</td>
                      <td>€ {parseFloat(p.importo_camera).toFixed(2)}</td>
                      <td>€ {parseFloat(p.importo_servizi).toFixed(2)}</td>
                      <td className="fw-bold">
                        € {parseFloat(p.totale).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {prenotazioni.length === 0 && riepilogo && (
            <p className="text-muted">
              Nessuna prenotazione nel periodo selezionato.
            </p>
          )}
        </>
      )}

      {/* === TAB OCCUPAZIONE === */}
      {tabAttiva === "occupazione" && kpi && (
        <>
          {/* KPI principali */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 bg-primary text-white">
                <div className="card-body text-center">
                  <h2 className="fw-bold">{kpi.tasso_occupazione}%</h2>
                  <p className="mb-0 small">Tasso di occupazione</p>
                  <p className="mb-0 opacity-75 small">
                    {kpi.notti_vendute} su {kpi.notti_disponibili} notti
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-success text-white">
                <div className="card-body text-center">
                  <h2 className="fw-bold">€ {kpi.adr.toFixed(2)}</h2>
                  <p className="mb-0 small">ADR</p>
                  <p className="mb-0 opacity-75 small">
                    Tariffa media giornaliera
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-info text-black">
                <div className="card-body text-center">
                  <h2 className="fw-bold">€ {kpi.revpar.toFixed(2)}</h2>
                  <p className="mb-0 small">RevPAR</p>
                  <p className="mb-0 opacity-75 small">
                    Ricavo per camera disponibile
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-warning text-dark">
                <div className="card-body text-center">
                  <h2 className="fw-bold">€ {kpi.ricavi_totali.toFixed(2)}</h2>
                  <p className="mb-0 small">Ricavi totali</p>
                  <p className="mb-0 opacity-75 small">Camera + servizi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dettaglio ricavi */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">Dettaglio ricavi</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Ricavi camere</span>
                    <strong>€ {kpi.ricavi_camere.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Ricavi servizi extra</span>
                    <strong>€ {kpi.ricavi_servizi.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="fw-bold">Totale</span>
                    <strong className="text-primary">
                      € {kpi.ricavi_totali.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">Dati periodo</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Prenotazioni</span>
                    <strong>{kpi.num_prenotazioni}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Notti vendute</span>
                    <strong>{kpi.notti_vendute}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span>Notti disponibili</span>
                    <strong>{kpi.notti_disponibili}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span>Camere totali</span>
                    <strong>{kpi.totale_camere}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown canali */}
          {canali.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Analisi per canale</h6>
              </div>
              <div className="card-body p-0">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Canale</th>
                      <th>Prenotazioni</th>
                      <th>Notti</th>
                      <th>Ricavi</th>
                      <th>% sul totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {canali.map((c) => (
                      <tr key={c.canale}>
                        <td>
                          <span className="badge bg-secondary">{c.canale}</span>
                        </td>
                        <td>{c.num_prenotazioni}</td>
                        <td>{c.notti}</td>
                        <td>€ {parseFloat(c.ricavi).toFixed(2)}</td>
                        <td>
                          {kpi.ricavi_camere > 0
                            ? Math.round(
                                (parseFloat(c.ricavi) / kpi.ricavi_camere) *
                                  100,
                              )
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
