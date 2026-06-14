"use client";

import { useEffect, useState } from "react";

type Sconto = {
  id_sconto: number;
  codice: string;
  descrizione: string;
  tipo: string;
  valore: string;
  data_scadenza: string | null;
  attivo: boolean;
};

type FormData = {
  codice: string;
  descrizione: string;
  tipo: string;
  valore: number;
  data_scadenza: string;
  attivo: boolean;
};

const formVuoto: FormData = {
  codice: "",
  descrizione: "",
  tipo: "percentuale",
  valore: 0,
  data_scadenza: "",
  attivo: true,
};

export default function ScontiPage() {
  const [sconti, setSconti] = useState<Sconto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scontoSelezionato, setScontoSelezionato] = useState<Sconto | null>(
    null,
  );
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchSconti();
  }, []);

  async function fetchSconti() {
    setLoading(true);
    const res = await fetch("/api/sconti");
    setSconti(await res.json());
    setLoading(false);
  }

  function apriModaleCrea() {
    setScontoSelezionato(null);
    setForm(formVuoto);
    setShowModal(true);
  }

  function apriModaleModifica(s: Sconto) {
    setScontoSelezionato(s);
    setForm({
      codice: s.codice,
      descrizione: s.descrizione || "",
      tipo: s.tipo,
      valore: parseFloat(s.valore),
      data_scadenza: s.data_scadenza || "",
      attivo: s.attivo,
    });
    setShowModal(true);
  }

  function chiudiModale() {
    setShowModal(false);
    setScontoSelezionato(null);
    setForm(formVuoto);
  }

  async function salvaSconto() {
    if (!form.codice || !form.valore) {
      alert("Codice e valore sono obbligatori.");
      return;
    }
    if (
      form.tipo === "percentuale" &&
      (form.valore <= 0 || form.valore > 100)
    ) {
      alert("Lo sconto percentuale deve essere tra 1 e 100.");
      return;
    }

    if (scontoSelezionato) {
      const res = await fetch(`/api/sconti/${scontoSelezionato.id_sconto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.errore);
        return;
      }
    } else {
      const res = await fetch("/api/sconti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.errore);
        return;
      }
    }
    chiudiModale();
    fetchSconti();
  }

  async function eliminaSconto(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questo sconto?")) return;
    const res = await fetch(`/api/sconti/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.errore);
      return;
    }
    fetchSconti();
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Sconti e Codici Promozionali</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Nuovo Sconto
        </button>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : sconti.length === 0 ? (
        <p className="text-secondary">Nessuno sconto configurato.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Codice</th>
              <th>Descrizione</th>
              <th>Tipo</th>
              <th>Valore</th>
              <th>Scadenza</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {sconti.map((s) => (
              <tr key={s.id_sconto}>
                <td>
                  <code className="fw-bold">{s.codice}</code>
                </td>
                <td>{s.descrizione}</td>
                <td>
                  <span
                    className={`badge ${s.tipo === "percentuale" ? "bg-info" : "bg-warning text-dark"}`}
                  >
                    {s.tipo}
                  </span>
                </td>
                <td className="fw-bold">
                  {s.tipo === "percentuale"
                    ? `${parseFloat(s.valore).toFixed(0)}%`
                    : `€ ${parseFloat(s.valore).toFixed(2)}`}
                </td>
                <td>
                  {s.data_scadenza || (
                    <span className="text-muted fst-italic">Nessuna</span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${s.attivo ? "bg-success" : "bg-secondary"}`}
                  >
                    {s.attivo ? "Attivo" : "Disattivato"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => apriModaleModifica(s)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaSconto(s.id_sconto)}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {scontoSelezionato ? "Modifica Sconto" : "Nuovo Sconto"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Codice *</label>
                    <input
                      className="form-control text-uppercase"
                      placeholder="es. ESTATE2026"
                      value={form.codice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          codice: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <div className="form-text">
                      Il codice viene automaticamente convertito in maiuscolo.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descrizione</label>
                    <input
                      className="form-control"
                      placeholder="es. Sconto estate 2026"
                      value={form.descrizione}
                      onChange={(e) =>
                        setForm({ ...form, descrizione: e.target.value })
                      }
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo *</label>
                      <select
                        className="form-select"
                        value={form.tipo}
                        onChange={(e) =>
                          setForm({ ...form, tipo: e.target.value })
                        }
                      >
                        <option value="percentuale">Percentuale (%)</option>
                        <option value="fisso">Importo fisso (€)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Valore {form.tipo === "percentuale" ? "(%)" : "(€)"} *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={form.tipo === "percentuale" ? 100 : undefined}
                        className="form-control"
                        value={form.valore}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            valore: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Data scadenza (opzionale)
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.data_scadenza}
                      onChange={(e) =>
                        setForm({ ...form, data_scadenza: e.target.value })
                      }
                    />
                  </div>

                  {scontoSelezionato && (
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="attivo"
                        checked={form.attivo}
                        onChange={(e) =>
                          setForm({ ...form, attivo: e.target.checked })
                        }
                      />
                      <label className="form-check-label" htmlFor="attivo">
                        Sconto attivo
                      </label>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaSconto}>
                    {scontoSelezionato ? "Salva Modifiche" : "Crea Sconto"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={chiudiModale} />
        </>
      )}
    </div>
  );
}
