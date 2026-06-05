"use client";

import { useEffect, useState } from "react";

type Ospite = {
  id_ospite: number;
  nome: string;
  cognome: string;
  tipo_documento: string;
  numero_documento: string;
  nazionalita: string;
  telefono: string;
  email: string;
  data_nascita: string;
  indirizzo: string;
  note: string;
  data_registrazione: string;
};

type FormData = {
  nome: string;
  cognome: string;
  tipo_documento: string;
  numero_documento: string;
  nazionalita: string;
  telefono: string;
  email: string;
  data_nascita: string;
  indirizzo: string;
  note: string;
};

const formVuoto: FormData = {
  nome: "",
  cognome: "",
  tipo_documento: "Carta d'Identità",
  numero_documento: "",
  nazionalita: "Italiana",
  telefono: "",
  email: "",
  data_nascita: "",
  indirizzo: "",
  note: "",
};

export default function OspitiPage() {
  const [ospiti, setOspiti] = useState<Ospite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [ospiteSelezionato, setOspiteSelezionato] = useState<Ospite | null>(
    null,
  );
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchOspiti();
  }, []);
  // Funzione per recuperare gli ospiti dal backend, con ricerca
  async function fetchOspiti(searchTerm = "") {
    setLoading(true);
    const url = searchTerm
      ? `/api/ospiti?search=${encodeURIComponent(searchTerm)}`
      : "/api/ospiti";
    const res = await fetch(url);
    const data = await res.json();
    setOspiti(data);
    setLoading(false);
  }

  // Funzione per aprire la modale di creazione
  function apriModaleCrea() {
    setOspiteSelezionato(null);
    setForm(formVuoto);
    setShowModal(true);
  }
  // Funzione per aprire la modale di modifica, precompilando i campi
  function apriModaleModifica(ospite: Ospite) {
    setOspiteSelezionato(ospite);
    setForm({
      nome: ospite.nome,
      cognome: ospite.cognome,
      tipo_documento: ospite.tipo_documento,
      numero_documento: ospite.numero_documento,
      nazionalita: ospite.nazionalita,
      telefono: ospite.telefono || "",
      email: ospite.email || "",
      data_nascita: ospite.data_nascita
        ? ospite.data_nascita.split("T")[0]
        : "",
      indirizzo: ospite.indirizzo || "",
      note: ospite.note || "",
    });
    setShowModal(true);
  }
  // Funzione per chiudere la modale
  function chiudiModale() {
    setShowModal(false);
    setOspiteSelezionato(null);
    setForm(formVuoto);
  }
  // Funzione per salvare (creare o modificare) un ospite
  async function salvaOspite() {
    if (ospiteSelezionato) {
      await fetch(`/api/ospiti/${ospiteSelezionato.id_ospite}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/ospiti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    chiudiModale();
    fetchOspiti(search);
  }
  // Funzione per eliminare un ospite
  async function eliminaOspite(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questo ospite?")) return;
    await fetch(`/api/ospiti/${id}`, { method: "DELETE" });
    fetchOspiti(search);
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestione Ospiti</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Aggiungi Ospite
        </button>
      </div>

      {/* BARRA DI RICERCA -- onSubmit ricerca*/}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchOspiti(search);
        }}
        className="d-flex gap-2 mb-4"
      >
        <input
          type="text"
          className="form-control"
          placeholder="Cerca per nome, cognome, telefono, documento, nazionalità..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary">
          Cerca
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => {
            setSearch("");
            fetchOspiti();
          }}
        >
          Reset
        </button>
      </form>

      {loading ? (
        <p>Caricamento...</p>
      ) : ospiti.length === 0 ? (
        <p>Nessun ospite trovato.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Cognome</th>
              <th>Nome</th>
              <th>Documento</th>
              <th>Nazionalità</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {ospiti.map((ospite) => (
              <tr key={ospite.id_ospite}>
                <td>{ospite.cognome}</td>
                <td>{ospite.nome}</td>
                <td>
                  {ospite.tipo_documento} — {ospite.numero_documento}
                </td>
                <td>{ospite.nazionalita}</td>
                <td>{ospite.telefono}</td>
                <td>{ospite.email}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => apriModaleModifica(ospite)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaOspite(ospite.id_ospite)}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODALE */}
      {showModal && (
        <>
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {ospiteSelezionato ? "Modifica Ospite" : "Nuovo Ospite"}
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo Documento *</label>
                      <select
                        className="form-select"
                        value={form.tipo_documento}
                        onChange={(e) =>
                          setForm({ ...form, tipo_documento: e.target.value })
                        }
                      >
                        <option>Carta d&apos;Identità</option>
                        <option>Passaporto</option>
                        <option>Patente</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Numero Documento *</label>
                      <input
                        className="form-control"
                        value={form.numero_documento}
                        onChange={(e) =>
                          setForm({ ...form, numero_documento: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nazionalità *</label>
                      <input
                        className="form-control"
                        value={form.nazionalita}
                        onChange={(e) =>
                          setForm({ ...form, nazionalita: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Data di Nascita</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.data_nascita}
                        onChange={(e) =>
                          setForm({ ...form, data_nascita: e.target.value })
                        }
                      />
                    </div>
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
                  <div className="mb-3">
                    <label className="form-label">Indirizzo</label>
                    <input
                      className="form-control"
                      value={form.indirizzo}
                      onChange={(e) =>
                        setForm({ ...form, indirizzo: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Note (allergie, preferenze, animali)
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.note}
                      onChange={(e) =>
                        setForm({ ...form, note: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaOspite}>
                    {ospiteSelezionato ? "Salva Modifiche" : "Crea Ospite"}
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
