"use client";

import { useEffect, useState } from "react";

type Tariffa = {
  id_tariffa: number;
  id_camera: number | null;
  camera_nome: string | null;
  nome: string;
  tipo: string;
  data_inizio: string;
  data_fine: string;
  prezzo_per_notte: string;
};

type Camera = {
  id_camera: number;
  nome_numero: string;
  tipologia: string;
};

type FormData = {
  id_camera: number | "";
  nome: string;
  tipo: string;
  data_inizio: string;
  data_fine: string;
  prezzo_per_notte: number;
};

const formVuoto: FormData = {
  id_camera: "",
  nome: "",
  tipo: "Alta stagione",
  data_inizio: "",
  data_fine: "",
  prezzo_per_notte: 0,
};

const badgeTipo: Record<string, string> = {
  "Alta stagione": "bg-danger",
  "Bassa stagione": "bg-success",
  Weekend: "bg-primary",
  Festività: "bg-warning text-dark",
  Evento: "bg-info",
};

export default function TariffeStagionaliPage() {
  const [tariffe, setTariffe] = useState<Tariffa[]>([]);
  const [camere, setCamere] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tariffaSelezionata, setTariffaSelezionata] = useState<Tariffa | null>(
    null,
  );
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchTariffe();
    fetchCamere();
  }, []);

  async function fetchTariffe() {
    setLoading(true);
    const res = await fetch("/api/tariffe-stagionali");
    setTariffe(await res.json());
    setLoading(false);
  }

  async function fetchCamere() {
    const res = await fetch("/api/camere");
    setCamere(await res.json());
  }

  function apriModaleCrea() {
    setTariffaSelezionata(null);
    setForm(formVuoto);
    setShowModal(true);
  }

  function apriModaleModifica(t: Tariffa) {
    setTariffaSelezionata(t);
    setForm({
      id_camera: t.id_camera || "",
      nome: t.nome,
      tipo: t.tipo,
      data_inizio: t.data_inizio,
      data_fine: t.data_fine,
      prezzo_per_notte: parseFloat(t.prezzo_per_notte),
    });
    setShowModal(true);
  }

  function chiudiModale() {
    setShowModal(false);
    setTariffaSelezionata(null);
    setForm(formVuoto);
  }

  async function salvaTariffa() {
    if (
      !form.nome ||
      !form.data_inizio ||
      !form.data_fine ||
      !form.prezzo_per_notte
    ) {
      alert("Compila tutti i campi obbligatori.");
      return;
    }

    if (tariffaSelezionata) {
      await fetch(`/api/tariffe-stagionali/${tariffaSelezionata.id_tariffa}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      const res = await fetch("/api/tariffe-stagionali", {
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
    fetchTariffe();
  }

  async function eliminaTariffa(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questa tariffa?")) return;
    await fetch(`/api/tariffe-stagionali/${id}`, { method: "DELETE" });
    fetchTariffe();
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Tariffe Stagionali</h1>
          <p className="text-secondary small mb-0">
            Le tariffe stagionali sovrascrivono il prezzo base delle camere nel
            periodo indicato.
          </p>
        </div>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Nuova Tariffa
        </button>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : tariffe.length === 0 ? (
        <div className="alert alert-info">
          Nessuna tariffa stagionale configurata. Le camere useranno il prezzo
          base.
        </div>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Camera</th>
              <th>Dal</th>
              <th>Al</th>
              <th>Prezzo/Notte</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {tariffe.map((t) => (
              <tr key={t.id_tariffa}>
                <td>{t.nome}</td>
                <td>
                  <span
                    className={`badge ${badgeTipo[t.tipo] || "bg-secondary"}`}
                  >
                    {t.tipo}
                  </span>
                </td>
                <td>
                  {t.camera_nome || (
                    <span className="text-muted fst-italic">
                      Tutte le camere
                    </span>
                  )}
                </td>
                <td>{t.data_inizio}</td>
                <td>{t.data_fine}</td>
                <td className="fw-bold">
                  € {parseFloat(t.prezzo_per_notte).toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => apriModaleModifica(t)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaTariffa(t.id_tariffa)}
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
                    {tariffaSelezionata
                      ? "Modifica Tariffa"
                      : "Nuova Tariffa Stagionale"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome tariffa *</label>
                    <input
                      className="form-control"
                      placeholder="es. Estate 2026, Ferragosto..."
                      value={form.nome}
                      onChange={(e) =>
                        setForm({ ...form, nome: e.target.value })
                      }
                    />
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
                      <option>Alta stagione</option>
                      <option>Bassa stagione</option>
                      <option>Weekend</option>
                      <option>Festività</option>
                      <option>Evento</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Camera (lascia vuoto per tutte)
                    </label>
                    <select
                      className="form-select"
                      value={form.id_camera}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          id_camera: e.target.value
                            ? Number(e.target.value)
                            : "",
                        })
                      }
                    >
                      <option value="">Tutte le camere</option>
                      {camere.map((c) => (
                        <option key={c.id_camera} value={c.id_camera}>
                          {c.nome_numero} — {c.tipologia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Data inizio *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.data_inizio}
                        onChange={(e) =>
                          setForm({ ...form, data_inizio: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Data fine *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={form.data_fine}
                        onChange={(e) =>
                          setForm({ ...form, data_fine: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Prezzo per notte (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      value={form.prezzo_per_notte}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prezzo_per_notte: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaTariffa}>
                    {tariffaSelezionata ? "Salva Modifiche" : "Crea Tariffa"}
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
