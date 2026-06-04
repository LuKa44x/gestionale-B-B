"use client";

import { useEffect, useState } from "react";

type Camera = {
  id_camera: number;
  nome_numero: string;
  tipologia: string;
  capienza_max: number;
  prezzo_base_notte: string;
  descrizione: string;
  servizi_inclusi: string;
  stato: string;
};

type FormData = {
  nome_numero: string;
  tipologia: string;
  capienza_max: number;
  prezzo_base_notte: number;
  descrizione: string;
  servizi_inclusi: string;
  stato: string;
};

const formVuoto: FormData = {
  nome_numero: "",
  tipologia: "Singola",
  capienza_max: 1,
  prezzo_base_notte: 0,
  descrizione: "",
  servizi_inclusi: "",
  stato: "Pulita",
};

export default function CamerePage() {
  const [camere, setCamere] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cameraSelezionata, setCameraSelezionata] = useState<Camera | null>(
    null,
  );
  const [form, setForm] = useState<FormData>(formVuoto);

  useEffect(() => {
    fetchCamere();
  }, []);

  async function fetchCamere() {
    const res = await fetch("/api/camere");
    const data = await res.json();
    setCamere(data);
    setLoading(false);
  }

  function apriModaleCrea() {
    setCameraSelezionata(null);
    setForm(formVuoto);
    setShowModal(true);
  }

  function apriModaleModifica(camera: Camera) {
    setCameraSelezionata(camera);
    setForm({
      nome_numero: camera.nome_numero,
      tipologia: camera.tipologia,
      capienza_max: camera.capienza_max,
      prezzo_base_notte: parseFloat(camera.prezzo_base_notte),
      descrizione: camera.descrizione || "",
      servizi_inclusi: camera.servizi_inclusi || "",
      stato: camera.stato,
    });
    setShowModal(true);
  }

  function chiudiModale() {
    setShowModal(false);
    setCameraSelezionata(null);
    setForm(formVuoto);
  }

  async function salvaCamera() {
    if (cameraSelezionata) {
      await fetch(`/api/camere/${cameraSelezionata.id_camera}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/camere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    chiudiModale();
    fetchCamere();
  }

  async function eliminaCamera(id: number) {
    if (!confirm("Sei sicuro di voler eliminare questa camera?")) return;
    await fetch(`/api/camere/${id}`, { method: "DELETE" });
    fetchCamere();
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestione Camere</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Aggiungi Camera
        </button>
      </div>

      {loading ? (
        <p>Caricamento...</p>
      ) : camere.length === 0 ? (
        <p>Nessuna camera presente.</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nome/Numero</th>
              <th>Tipologia</th>
              <th>Capienza</th>
              <th>Prezzo/Notte</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {camere.map((camera) => (
              <tr key={camera.id_camera}>
                <td>{camera.nome_numero}</td>
                <td>{camera.tipologia}</td>
                <td>{camera.capienza_max}</td>
                <td>€ {camera.prezzo_base_notte}</td>
                <td>
                  <span
                    className={`badge ${
                      camera.stato === "Pulita"
                        ? "bg-success"
                        : camera.stato === "Da pulire"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                    }`}
                  >
                    {camera.stato}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => apriModaleModifica(camera)}
                  >
                    Modifica
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminaCamera(camera.id_camera)}
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
                    {cameraSelezionata ? "Modifica Camera" : "Nuova Camera"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome/Numero</label>
                    <input
                      className="form-control"
                      value={form.nome_numero}
                      onChange={(e) =>
                        setForm({ ...form, nome_numero: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipologia</label>
                    <select
                      className="form-select"
                      value={form.tipologia}
                      onChange={(e) =>
                        setForm({ ...form, tipologia: e.target.value })
                      }
                    >
                      <option>Singola</option>
                      <option>Doppia</option>
                      <option>Matrimoniale</option>
                      <option>Tripla</option>
                      <option>Suite</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Capienza Massima</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.capienza_max}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          capienza_max: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Prezzo Base a Notte (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={form.prezzo_base_notte}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          prezzo_base_notte: parseFloat(e.target.value),
                        })
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
                  <div className="mb-3">
                    <label className="form-label">Servizi Inclusi</label>
                    <input
                      className="form-control"
                      value={form.servizi_inclusi}
                      onChange={(e) =>
                        setForm({ ...form, servizi_inclusi: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stato</label>
                    <select
                      className="form-select"
                      value={form.stato}
                      onChange={(e) =>
                        setForm({ ...form, stato: e.target.value })
                      }
                    >
                      <option>Pulita</option>
                      <option>Da pulire</option>
                      <option>In manutenzione</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button className="btn btn-primary" onClick={salvaCamera}>
                    {cameraSelezionata ? "Salva Modifiche" : "Crea Camera"}
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
