"use client";

import { useEffect, useState } from "react";

type Dipendente = {
  id_dipendente: number;
  nome: string;
  cognome: string;
  ruolo: string;
  telefono: string;
  email: string;
  stipendio: string;
  data_assunzione: string;
};

type FormData = {
  nome: string;
  cognome: string;
  ruolo: string;
  telefono: string;
  email: string;
  stipendio: number;
  data_assunzione: string;
};

const formVuoto: FormData = {
  nome: "",
  cognome: "",
  ruolo: "Reception",
  telefono: "",
  email: "",
  stipendio: 0,
  data_assunzione: "",
};

export default function PersonalePage() {
  const [personale, setPersonale] = useState<Dipendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dipendenteSelezionato, setDipendenteSelezionato] =
    useState<Dipendente | null>(null);
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchPersonale();
  }, []);

  // Funzione per recuperare il personale dal backend
  async function fetchPersonale() {
    setLoading(true);
    const res = await fetch("/api/personale");
    const data = await res.json();
    setPersonale(data);
    setLoading(false);
  }
  // Funzione per gestire la modale di creazione
  function apriModaleCrea() {
    setDipendenteSelezionato(null);
    setForm(formVuoto);
    setShowModal(true);
  }
  // Funzione per gestire la modale di modifica
  function apriModaleModifica(d: Dipendente) {
    setDipendenteSelezionato(d);
    setForm({
      nome: d.nome,
      cognome: d.cognome,
      ruolo: d.ruolo,
      telefono: d.telefono || "",
      email: d.email || "",
      stipendio: parseFloat(d.stipendio),
      data_assunzione: d.data_assunzione || "",
    });
    setShowModal(true);
  }
  // Funzione per chiudere la modale
  function chiudiModale() {
    setShowModal(false);
    setDipendenteSelezionato(null);
    setForm(formVuoto);
  }
  // Funzione per salvare (creare o modificare) un dipendente
  async function salvaDipendente() {
    // Validazione base per data di assunzione
    if (!form.data_assunzione) {
      alert("La data di assunzione è obbligatoria.");
      return;
    }
    if (dipendenteSelezionato) {
      await fetch(`/api/personale/${dipendenteSelezionato.id_dipendente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/personale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    chiudiModale();
    fetchPersonale();
  }
  // Funzione per eliminare un dipendente
  async function eliminaDipendente(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questo dipendente?")) return;
    await fetch(`/api/personale/${id}`, { method: "DELETE" });
    fetchPersonale();
  }

  const badgeRuolo: Record<string, string> = {
    Manager: "bg-danger",
    Reception: "bg-primary",
    Housekeeping: "bg-success",
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestione Personale</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Aggiungi Dipendente
        </button>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : personale.length === 0 ? (
        <p>Nessun dipendente presente.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Cognome</th>
              <th>Nome</th>
              <th>Ruolo</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Stipendio</th>
              <th>Assunto il</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {personale.map((d) => (
              <tr key={d.id_dipendente}>
                <td>{d.cognome}</td>
                <td>{d.nome}</td>
                <td>
                  <span
                    className={`badge ${badgeRuolo[d.ruolo] || "bg-secondary"}`}
                  >
                    {d.ruolo}
                  </span>
                </td>
                <td>{d.telefono}</td>
                <td>{d.email}</td>
                <td>€ {d.stipendio}</td>
                <td>{d.data_assunzione}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => apriModaleModifica(d)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaDipendente(d.id_dipendente)}
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
                    {dipendenteSelezionato
                      ? "Modifica Dipendente"
                      : "Nuovo Dipendente"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nome *</label>
                      <input
                        className="form-control"
                        value={form.nome}
                        onChange={(e) =>
                          setForm({ ...form, nome: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Cognome *</label>
                      <input
                        className="form-control"
                        value={form.cognome}
                        onChange={(e) =>
                          setForm({ ...form, cognome: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ruolo *</label>
                    <select
                      className="form-select"
                      value={form.ruolo}
                      onChange={(e) =>
                        setForm({ ...form, ruolo: e.target.value })
                      }
                    >
                      <option>Reception</option>
                      <option>Housekeeping</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Telefono</label>
                      <input
                        className="form-control"
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({ ...form, telefono: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stipendio (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={form.stipendio}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            stipendio: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Data Assunzione *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.data_assunzione}
                        onChange={(e) =>
                          setForm({ ...form, data_assunzione: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaDipendente}>
                    {dipendenteSelezionato
                      ? "Salva Modifiche"
                      : "Crea Dipendente"}
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
