"use client";

import { useEffect, useState } from "react";

type Servizio = {
  id_servizio: number;
  nome_servizio: string;
  descrizione: string;
  costo: string;
  unita_misura: string;
};

type FormData = {
  nome_servizio: string;
  descrizione: string;
  costo: number;
  unita_misura: string;
};

const formVuoto: FormData = {
  nome_servizio: "",
  descrizione: "",
  costo: 0,
  unita_misura: "una tantum",
};

export default function ServiziExtraPage() {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [servizioSelezionato, setServizioSelezionato] =
    useState<Servizio | null>(null);
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchServizi();
  }, []);

  // Funzione per recuperare i servizi extra dal backend
  async function fetchServizi() {
    setLoading(true);
    const res = await fetch("/api/servizi-extra");
    const data = await res.json();
    setServizi(data);
    setLoading(false);
  }

  // Funzioni per gestire la modale di creazione
  function apriModaleCrea() {
    setServizioSelezionato(null);
    setForm(formVuoto);
    setShowModal(true);
  }

  // Funzione per gestire la modale di modifica
  function apriModaleModifica(s: Servizio) {
    setServizioSelezionato(s);
    setForm({
      nome_servizio: s.nome_servizio,
      descrizione: s.descrizione || "",
      costo: parseFloat(s.costo),
      unita_misura: s.unita_misura,
    });
    setShowModal(true);
  }

  // Funzione per chiudere la modale e resettare lo stato
  function chiudiModale() {
    setShowModal(false);
    setServizioSelezionato(null);
    setForm(formVuoto);
  }

  // Funzione per salvare un nuovo servizio o aggiornare uno esistente
  async function salvaServizio() {
    if (servizioSelezionato) {
      await fetch(`/api/servizi-extra/${servizioSelezionato.id_servizio}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/servizi-extra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    chiudiModale();
    fetchServizi();
  }

  // Funzione per eliminare un servizio
  async function eliminaServizio(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;
    await fetch(`/api/servizi-extra/${id}`, { method: "DELETE" });
    fetchServizi();
  }

  const badgeUnita: Record<string, string> = {
    "a notte": "bg-primary",
    "a persona": "bg-success",
    "una tantum": "bg-secondary",
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Servizi Extra</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Aggiungi Servizio
        </button>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : servizi.length === 0 ? (
        <p>Nessun servizio presente.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nome Servizio</th>
              <th>Descrizione</th>
              <th>Costo</th>
              <th>Unità di Misura</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {servizi.map((s) => (
              <tr key={s.id_servizio}>
                <td>{s.nome_servizio}</td>
                <td>{s.descrizione}</td>
                <td>€ {s.costo}</td>
                <td>
                  <span
                    className={`badge ${badgeUnita[s.unita_misura] || "bg-secondary"}`}
                  >
                    {s.unita_misura}
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
                    onClick={() => eliminaServizio(s.id_servizio)}
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
                    {servizioSelezionato
                      ? "Modifica Servizio"
                      : "Nuovo Servizio"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome Servizio *</label>
                    <input
                      className="form-control"
                      value={form.nome_servizio}
                      onChange={(e) =>
                        setForm({ ...form, nome_servizio: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrizione</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.descrizione}
                      onChange={(e) =>
                        setForm({ ...form, descrizione: e.target.value })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Costo (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={form.costo}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            costo: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Unità di Misura *</label>
                      <select
                        className="form-select"
                        value={form.unita_misura}
                        onChange={(e) =>
                          setForm({ ...form, unita_misura: e.target.value })
                        }
                      >
                        <option>a notte</option>
                        <option>a persona</option>
                        <option>una tantum</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaServizio}>
                    {servizioSelezionato ? "Salva Modifiche" : "Crea Servizio"}
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
