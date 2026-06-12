"use client";

import { useEffect, useState } from "react";

type Transazione = {
  id_transazione: number;
  id_prenotazione: number;
  data_ora_pagamento: string;
  tipo: string;
  importo: string;
  metodo_pagamento: string;
  ospite_nome: string;
  ospite_cognome: string;
  camera_nome: string;
  data_checkin: string;
  data_checkout: string;
};

type Riepilogo = {
  totale_incasso: number;
  totale_rimborsi: number;
  saldo_netto: number;
};

type Prenotazione = {
  id_prenotazione: number;
  ospite_nome: string;
  ospite_cognome: string;
  camera_nome: string;
  data_checkin: string;
  data_checkout: string;
  stato: string;
};

type FormPagamento = {
  id_prenotazione: number | "";
  tipo: string;
  importo: number;
  metodo_pagamento: string;
};

const formVuoto: FormPagamento = {
  id_prenotazione: "",
  tipo: "Caparra",
  importo: 0,
  metodo_pagamento: "Contanti",
};

export default function CassaPage() {
  const [transazioni, setTransazioni] = useState<Transazione[]>([]);
  const [riepilogo, setRiepilogo] = useState<Riepilogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroDa, setFiltroDa] = useState("");
  const [filtroA, setFiltroA] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormPagamento>(formVuoto);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);

  useEffect(() => {
    fetchTransazioni();
    fetchPrenotazioni();
  }, []);

  // recupero transazioni
  async function fetchTransazioni(
    tipo = filtroTipo,
    metodo = filtroMetodo,
    da = filtroDa,
    a = filtroA,
  ) {
    setLoading(true);
    let url = "/api/cassa?";
    if (tipo) url += `tipo=${encodeURIComponent(tipo)}&`;
    if (metodo) url += `metodo=${encodeURIComponent(metodo)}&`;
    if (da) url += `da=${da}&`;
    if (a) url += `a=${a}`;
    const res = await fetch(url);
    const data = await res.json();
    setTransazioni(data.transazioni);
    setRiepilogo(data.riepilogo);
    setLoading(false);
  }

  // recupero prenotazioni con filtri stato
  async function fetchPrenotazioni() {
    const res = await fetch("/api/prenotazioni?stato=Confermata");
    const data1 = await res.json();
    const res2 = await fetch("/api/prenotazioni?stato=Check-in%20effettuato");
    const data2 = await res2.json();
    setPrenotazioni([...data1, ...data2]);
  }

  // salvo il pagamento
  async function salvaPagamento() {
    if (!form.id_prenotazione || !form.importo) {
      alert("Seleziona una prenotazione e inserisci un importo.");
      return;
    }
    const res = await fetch(`/api/prenotazioni/${form.id_prenotazione}/cassa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: form.tipo,
        importo: form.importo,
        metodo_pagamento: form.metodo_pagamento,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.errore);
      return;
    }
    setShowModal(false);
    setForm(formVuoto);
    fetchTransazioni();
  }

  // elimina transazione
  async function eliminaTransazione(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questa transazione?")) return;
    const res = await fetch(`/api/cassa/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.errore);
      return;
    }
    fetchTransazioni();
  }

  const badgeTipo: Record<string, string> = {
    Caparra: "bg-primary",
    Saldo: "bg-success",
    Rimborso: "bg-danger",
  };

  const badgeMetodo: Record<string, string> = {
    Contanti: "bg-secondary",
    Carta: "bg-info",
    Bonifico: "bg-warning text-dark",
    PayPal: "bg-primary",
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestione Cassa</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Registra Pagamento
        </button>
      </div>

      {/* RIEPILOGO */}
      {riepilogo && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center">
                <h3 className="fw-bold">
                  € {riepilogo.totale_incasso.toFixed(2)}
                </h3>
                <p className="mb-0 small">Totale incassato</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-danger text-white">
              <div className="card-body text-center">
                <h3 className="fw-bold">
                  € {riepilogo.totale_rimborsi.toFixed(2)}
                </h3>
                <p className="mb-0 small">Totale rimborsi</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="fw-bold">
                  € {riepilogo.saldo_netto.toFixed(2)}
                </h3>
                <p className="mb-0 small">Saldo netto</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTRI */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Tutti</option>
                <option>Caparra</option>
                <option>Saldo</option>
                <option>Rimborso</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Metodo</label>
              <select
                className="form-select"
                value={filtroMetodo}
                onChange={(e) => setFiltroMetodo(e.target.value)}
              >
                <option value="">Tutti</option>
                <option>Contanti</option>
                <option>Carta</option>
                <option>Bonifico</option>
                <option>PayPal</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Dal</label>
              <input
                type="date"
                className="form-control"
                value={filtroDa}
                onChange={(e) => setFiltroDa(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Al</label>
              <input
                type="date"
                className="form-control"
                value={filtroA}
                onChange={(e) => setFiltroA(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-primary w-100"
                onClick={() => fetchTransazioni()}
              >
                Filtra
              </button>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFiltroTipo("");
                  setFiltroMetodo("");
                  setFiltroDa("");
                  setFiltroA("");
                  fetchTransazioni("", "", "", "");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABELLA */}
      {loading ? (
        <p>Caricamento...</p>
      ) : transazioni.length === 0 ? (
        <p className="text-muted">Nessuna transazione trovata.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Data</th>
                <th>Ospite</th>
                <th>Camera</th>
                <th>Tipo</th>
                <th>Importo</th>
                <th>Metodo</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {transazioni.map((t) => (
                <tr key={t.id_transazione}>
                  <td>#{t.id_transazione}</td>
                  <td>
                    {new Date(t.data_ora_pagamento).toLocaleString("it-IT")}
                  </td>
                  <td>
                    {t.ospite_cognome} {t.ospite_nome}
                  </td>
                  <td>{t.camera_nome}</td>
                  <td>
                    <span
                      className={`badge ${badgeTipo[t.tipo] || "bg-secondary"}`}
                    >
                      {t.tipo}
                    </span>
                  </td>
                  <td className="fw-bold">
                    € {parseFloat(t.importo).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${badgeMetodo[t.metodo_pagamento] || "bg-secondary"}`}
                    >
                      {t.metodo_pagamento}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => eliminaTransazione(t.id_transazione)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALE */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Registra Pagamento</h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setForm(formVuoto);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Prenotazione *</label>
                    <select
                      className="form-select"
                      value={form.id_prenotazione}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          id_prenotazione: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Seleziona prenotazione...</option>
                      {prenotazioni.map((p) => (
                        <option
                          key={p.id_prenotazione}
                          value={p.id_prenotazione}
                        >
                          #{p.id_prenotazione} — {p.ospite_cognome}{" "}
                          {p.ospite_nome}— {p.camera_nome} ({p.data_checkin} →{" "}
                          {p.data_checkout})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-select"
                      value={form.tipo}
                      onChange={(e) =>
                        setForm({ ...form, tipo: e.target.value })
                      }
                    >
                      <option>Caparra</option>
                      <option>Saldo</option>
                      <option>Rimborso</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Importo (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={form.importo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          importo: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Metodo di Pagamento *</label>
                    <select
                      className="form-select"
                      value={form.metodo_pagamento}
                      onChange={(e) =>
                        setForm({ ...form, metodo_pagamento: e.target.value })
                      }
                    >
                      <option>Contanti</option>
                      <option>Carta</option>
                      <option>Bonifico</option>
                      <option>PayPal</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setForm(formVuoto);
                    }}
                  >
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaPagamento}>
                    Registra
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => {
              setShowModal(false);
              setForm(formVuoto);
            }}
          />
        </>
      )}
    </div>
  );
}
