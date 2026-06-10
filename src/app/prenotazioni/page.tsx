"use client";

import { useEffect, useState } from "react";

type Prenotazione = {
  id_prenotazione: number;
  id_ospite: number;
  id_camera: number;
  data_checkin: string;
  data_checkout: string;
  numero_ospiti: number;
  stato: string;
  canale: string;
  note_prenotazione: string;
  ospite_nome: string;
  ospite_cognome: string;
  camera_nome: string;
  camera_tipologia: string;
  prezzo_base_notte: string;
};

type Ospite = { id_ospite: number; nome: string; cognome: string };
type Camera = {
  id_camera: number;
  nome_numero: string;
  tipologia: string;
  prezzo_base_notte: string;
};
type Servizio = {
  id_servizio: number;
  nome_servizio: string;
  costo: string;
  unita_misura: string;
};
//servizio che l'utente ha aggiunto al form con la sua quantità e prezzo finale calcolato
type ServizioSelezionato = {
  id_servizio: number;
  nome_servizio: string;
  quantita: number;
  prezzo_finale: number;
};

type FormData = {
  id_ospite: number | "";
  id_camera: number | "";
  data_checkin: string;
  data_checkout: string;
  numero_ospiti: number;
  canale: string;
  note_prenotazione: string;
  servizi: ServizioSelezionato[];
};

const formVuoto: FormData = {
  id_ospite: "",
  id_camera: "",
  data_checkin: "",
  data_checkout: "",
  numero_ospiti: 1,
  canale: "Diretto",
  note_prenotazione: "",
  servizi: [],
};

export default function PrenotazioniPage() {
  //Lista nella tabella principale
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState("");
  const [filtroCanale, setFiltroCanale] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [prenotazioneSelezionata, setPrenotazioneSelezionata] =
    useState<Prenotazione | null>(null);
  const [form, setForm] = useState<FormData>(formVuoto);
  //Lista per il select nel modale
  const [ospiti, setOspiti] = useState<Ospite[]>([]);
  //Camere libere nelle date scelte nel modale
  const [camereDisponibili, setCamereDisponibili] = useState<Camera[]>([]);
  //Tutti i servizi nel modale
  const [serviziDisponibili, setServiziDisponibili] = useState<Servizio[]>([]);
  //La camera scelta, per il prezzo totale
  const [cameraSelezionata, setCameraSelezionata] = useState<Camera | null>(
    null,
  );

  useEffect(() => {
    fetchPrenotazioni();
    fetchOspiti();
    fetchServizi();
  }, []);

  // Quando nel modal cambiano le date, ricarica le camere disponibili
  // [cambiamento quando checkin o checkout vengono modificati]
  useEffect(() => {
    if (form.data_checkin && form.data_checkout && showModal) {
      fetchCamereDisponibili(form.data_checkin, form.data_checkout);
    }
  }, [form.data_checkin, form.data_checkout, showModal]);

  // carica la lista prenotazioni con filtro stato o canale
  async function fetchPrenotazioni(stato = filtroStato, canale = filtroCanale) {
    setLoading(true);
    let url = "/api/prenotazioni?";
    if (stato) url += `stato=${encodeURIComponent(stato)}&`;
    if (canale) url += `canale=${encodeURIComponent(canale)}`;
    const res = await fetch(url);
    const data = await res.json();
    setPrenotazioni(data);
    setLoading(false);
  }

  // carica la lista degli ospiti per il select del form
  async function fetchOspiti() {
    const res = await fetch("/api/ospiti");
    setOspiti(await res.json());
  }

  // carica la lista dei servizi extra per il form
  async function fetchServizi() {
    const res = await fetch("/api/servizi-extra");
    setServiziDisponibili(await res.json());
  }

  // carica le camere disponibili in base alle date scelte, escludendo quella della prenotazione in modifica
  async function fetchCamereDisponibili(checkin: string, checkout: string) {
    const escludi = prenotazioneSelezionata
      ? `&escludi=${prenotazioneSelezionata.id_prenotazione}`
      : "";
    const res = await fetch(
      `/api/disponibilita?checkin=${checkin}&checkout=${checkout}${escludi}`,
    );
    const data = await res.json();
    setCamereDisponibili(Array.isArray(data) ? data : []);
  }

  // Calcola il numero di notti tra check-in e check-out
  function calcolaNotti(): number {
    if (!form.data_checkin || !form.data_checkout) return 0;
    const diff =
      new Date(form.data_checkout).getTime() -
      new Date(form.data_checkin).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Calcola il prezzo totale di un servizio in base alla quantità, alla durata del soggiorno e al numero di ospiti se necessario
  function calcolaPrezzoServizio(servizio: Servizio, quantita: number): number {
    const costo = parseFloat(servizio.costo);
    const notti = calcolaNotti();
    if (servizio.unita_misura === "a notte") return costo * quantita * notti;
    if (servizio.unita_misura === "a persona")
      return costo * quantita * form.numero_ospiti;
    return costo * quantita;
  }

  // Calcola il totale sommando il costo della camera per le notti e il costo di tutti i servizi extra
  function calcolaTotale(): number {
    const notti = calcolaNotti();
    const camera = cameraSelezionata
      ? parseFloat(cameraSelezionata.prezzo_base_notte) * notti
      : 0;
    const servizi = form.servizi.reduce((sum, s) => sum + s.prezzo_finale, 0);
    return camera + servizi;
  }

  // Aggiunge un servizio alla lista dei servizi selezionati nel form, no duplicati
  function aggiungiServizio(servizio: Servizio) {
    if (form.servizi.find((s) => s.id_servizio === servizio.id_servizio))
      return;
    const nuovo: ServizioSelezionato = {
      id_servizio: servizio.id_servizio,
      nome_servizio: servizio.nome_servizio,
      quantita: 1,
      prezzo_finale: calcolaPrezzoServizio(servizio, 1),
    };
    setForm({ ...form, servizi: [...form.servizi, nuovo] });
  }

  // Aggiorna la quantità del servizio
  function aggiornaQuantita(id: number, quantita: number) {
    const servizio = serviziDisponibili.find((s) => s.id_servizio === id);
    if (!servizio) return;
    setForm({
      ...form,
      servizi: form.servizi.map((s) =>
        s.id_servizio === id
          ? {
              ...s,
              quantita,
              prezzo_finale: calcolaPrezzoServizio(servizio, quantita),
            }
          : s,
      ),
    });
  }

  // Rimuove un servizio dalla list form
  function rimuoviServizio(id: number) {
    setForm({
      ...form,
      servizi: form.servizi.filter((s) => s.id_servizio !== id),
    });
  }
  // Apre il modal in modalità creazione, resettando tutti i campi
  function apriModaleCrea() {
    setPrenotazioneSelezionata(null);
    setForm(formVuoto);
    setCameraSelezionata(null);
    setCamereDisponibili([]);
    setShowModal(true);
  }
  // Apre il modal in modalità modifica, con dati prenotazione, rimuovendo la camera da disponibile in caso di cambio
  function apriModaleModifica(p: Prenotazione) {
    setPrenotazioneSelezionata(p);
    setCameraSelezionata({
      id_camera: p.id_camera,
      nome_numero: p.camera_nome,
      tipologia: p.camera_tipologia,
      prezzo_base_notte: p.prezzo_base_notte,
    });
    setForm({
      id_ospite: p.id_ospite,
      id_camera: p.id_camera,
      data_checkin: p.data_checkin,
      data_checkout: p.data_checkout,
      numero_ospiti: p.numero_ospiti,
      canale: p.canale,
      note_prenotazione: p.note_prenotazione || "",
      servizi: [],
    });
    setShowModal(true);
  }
  // Chiude il modal e resetta tutti i campi
  function chiudiModale() {
    setShowModal(false);
    setPrenotazioneSelezionata(null);
    setForm(formVuoto);
    setCameraSelezionata(null);
    setCamereDisponibili([]);
  }
  // Salva la prenotazione, POST se nuova o PUT se modifica
  async function salvaPrenotazione() {
    if (
      !form.id_ospite ||
      !form.id_camera ||
      !form.data_checkin ||
      !form.data_checkout
    ) {
      alert("Compila tutti i campi obbligatori: ospite, date e camera.");
      return;
    }
    const body = {
      ...form,
      servizi: form.servizi.map((s) => ({
        id_servizio: s.id_servizio,
        quantita: s.quantita,
        prezzo_finale: s.prezzo_finale,
      })),
    };
    if (prenotazioneSelezionata) {
      await fetch(
        `/api/prenotazioni/${prenotazioneSelezionata.id_prenotazione}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
    } else {
      const res = await fetch("/api/prenotazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.errore || "Errore nella creazione della prenotazione");
        return;
      }
    }
    chiudiModale();
    fetchPrenotazioni();
  }
  // Annulla la prenotazione con DELETE
  async function annullaPrenotazione(id: number) {
    if (!confirm("Sei sicuro di voler annullare questa prenotazione?")) return;
    await fetch(`/api/prenotazioni/${id}`, { method: "DELETE" });
    fetchPrenotazioni();
  }
  // Esegue il check-in con PUT, /[id]/checkin/ cambia lo stato in "Check-in effettuato"
  async function eseguiCheckin(id: number) {
    const res = await fetch(`/api/prenotazioni/${id}/checkin`, {
      method: "PUT",
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.errore);
      return;
    }
    fetchPrenotazioni();
  }
  // Esegue il check-out con PUT, /[id]/checkout/ cambia lo stato in "Check-out effettuato"
  async function eseguiCheckout(id: number) {
    const res = await fetch(`/api/prenotazioni/${id}/checkout`, {
      method: "PUT",
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.errore);
      return;
    }
    fetchPrenotazioni();
  }

  const badgeStato: Record<string, string> = {
    Confermata: "bg-primary",
    "Check-in effettuato": "bg-warning text-dark",
    "Check-out effettuato": "bg-success",
    Annullata: "bg-danger",
    "No-show": "bg-secondary",
  };

  const notti = calcolaNotti();
  const totale = calcolaTotale();

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestione Prenotazioni</h1>
        <button className="btn btn-primary" onClick={apriModaleCrea}>
          + Nuova Prenotazione
        </button>
      </div>

      {/* Filtri */}
      <div className="row g-2 mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={filtroStato}
            onChange={(e) => setFiltroStato(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            <option>Confermata</option>
            <option>Check-in effettuato</option>
            <option>Check-out effettuato</option>
            <option>Annullata</option>
            <option>No-show</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filtroCanale}
            onChange={(e) => setFiltroCanale(e.target.value)}
          >
            <option value="">Tutti i canali</option>
            <option>Diretto</option>
            <option>Booking</option>
            <option>Airbnb</option>
            <option>Expedia</option>
            <option>Altro</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-primary w-100"
            onClick={() => fetchPrenotazioni()}
          >
            Filtra
          </button>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setFiltroStato("");
              setFiltroCanale("");
              fetchPrenotazioni("", "");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Tabella */}
      {loading ? (
        <p>Caricamento...</p>
      ) : prenotazioni.length === 0 ? (
        <p>Nessuna prenotazione trovata.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Ospite</th>
                <th>Camera</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Stato</th>
                <th>Canale</th>
                <th>Azioni</th>
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
                  <td>
                    <span
                      className={`badge ${badgeStato[p.stato] || "bg-secondary"}`}
                    >
                      {p.stato}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">{p.canale}</span>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {p.stato !== "Annullata" &&
                        p.stato !== "Check-out effettuato" && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => apriModaleModifica(p)}
                          >
                            Modifica
                          </button>
                        )}
                      {p.stato === "Confermata" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => eseguiCheckin(p.id_prenotazione)}
                        >
                          Check-in
                        </button>
                      )}
                      {p.stato === "Check-in effettuato" && (
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => eseguiCheckout(p.id_prenotazione)}
                        >
                          Check-out
                        </button>
                      )}
                      {p.stato === "Confermata" && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => annullaPrenotazione(p.id_prenotazione)}
                        >
                          Annulla
                        </button>
                      )}
                    </div>
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
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {prenotazioneSelezionata
                      ? "Modifica Prenotazione"
                      : "Nuova Prenotazione"}
                  </h5>
                  <button className="btn-close" onClick={chiudiModale} />
                </div>
                <div className="modal-body">
                  <div className="row">
                    {/* colonna sinistra modal */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Ospite *</label>
                        <select
                          className="form-select"
                          value={form.id_ospite}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              id_ospite: Number(e.target.value),
                            })
                          }
                        >
                          <option value="">Seleziona ospite...</option>
                          {ospiti.map((o) => (
                            <option key={o.id_ospite} value={o.id_ospite}>
                              {o.cognome} {o.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Check-in *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.data_checkin}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                data_checkin: e.target.value,
                                id_camera: "",
                              })
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Check-out *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.data_checkout}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                data_checkout: e.target.value,
                                id_camera: "",
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Camera disponibile *
                        </label>
                        {!form.data_checkin || !form.data_checkout ? (
                          <p className="text-muted small fst-italic">
                            Seleziona prima le date.
                          </p>
                        ) : camereDisponibili.length === 0 ? (
                          <p className="text-danger small">
                            Nessuna camera disponibile per questo periodo.
                          </p>
                        ) : (
                          <select
                            className="form-select"
                            value={form.id_camera}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setCameraSelezionata(
                                camereDisponibili.find(
                                  (c) => c.id_camera === id,
                                ) || null,
                              );
                              setForm({ ...form, id_camera: id });
                            }}
                          >
                            <option value="">Seleziona camera...</option>
                            {camereDisponibili.map((c) => (
                              <option key={c.id_camera} value={c.id_camera}>
                                {c.nome_numero} — {c.tipologia} — €
                                {c.prezzo_base_notte}/notte
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">N. Ospiti *</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={form.numero_ospiti}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                numero_ospiti: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Canale</label>
                          <select
                            className="form-select"
                            value={form.canale}
                            onChange={(e) =>
                              setForm({ ...form, canale: e.target.value })
                            }
                          >
                            <option>Diretto</option>
                            <option>Booking</option>
                            <option>Airbnb</option>
                            <option>Expedia</option>
                            <option>Altro</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Note</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={form.note_prenotazione}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              note_prenotazione: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* colonna destra modal */}
                    <div className="col-md-6">
                      <label className="form-label">Servizi Extra</label>
                      <div
                        className="border rounded p-2 mb-2"
                        style={{ maxHeight: "160px", overflowY: "auto" }}
                      >
                        {serviziDisponibili.length === 0 ? (
                          <p className="text-muted small">
                            Nessun servizio disponibile.
                          </p>
                        ) : (
                          serviziDisponibili.map((s) => (
                            <div
                              key={s.id_servizio}
                              className="d-flex justify-content-between align-items-center py-1 border-bottom"
                            >
                              <div>
                                <span className="small">{s.nome_servizio}</span>
                                <span className="text-muted small ms-2">
                                  €{s.costo}/{s.unita_misura}
                                </span>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => aggiungiServizio(s)}
                              >
                                +
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {form.servizi.length > 0 && (
                        <div className="border rounded p-2 mb-3">
                          <p className="small fw-bold mb-1">
                            Servizi aggiunti:
                          </p>
                          {form.servizi.map((s) => (
                            <div
                              key={s.id_servizio}
                              className="d-flex justify-content-between align-items-center py-1"
                            >
                              <span className="small">{s.nome_servizio}</span>
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control form-control-sm"
                                  style={{ width: "60px" }}
                                  value={s.quantita}
                                  onChange={(e) =>
                                    aggiornaQuantita(
                                      s.id_servizio,
                                      parseInt(e.target.value),
                                    )
                                  }
                                />
                                <span className="small text-muted">
                                  €{s.prezzo_finale.toFixed(2)}
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => rimuoviServizio(s.id_servizio)}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* riepilogo totale */}
                      <div className="card border-primary">
                        <div className="card-body p-3">
                          <h6 className="card-title mb-2">Riepilogo costi</h6>
                          <div className="d-flex justify-content-between small">
                            <span>Notti:</span>
                            <strong>{notti}</strong>
                          </div>
                          {cameraSelezionata && (
                            <div className="d-flex justify-content-between small">
                              <span>
                                Camera ({notti} × €
                                {parseFloat(
                                  cameraSelezionata.prezzo_base_notte,
                                ).toFixed(2)}
                                ):
                              </span>
                              <strong>
                                €
                                {(
                                  parseFloat(
                                    cameraSelezionata.prezzo_base_notte,
                                  ) * notti
                                ).toFixed(2)}
                              </strong>
                            </div>
                          )}
                          {form.servizi.map((s) => (
                            <div
                              key={s.id_servizio}
                              className="d-flex justify-content-between text-muted small"
                            >
                              <span>{s.nome_servizio}:</span>
                              <span>€{s.prezzo_finale.toFixed(2)}</span>
                            </div>
                          ))}
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Totale stimato:</span>
                            <span className="text-primary fs-6">
                              €{totale.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={chiudiModale}>
                    Annulla
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={salvaPrenotazione}
                  >
                    {prenotazioneSelezionata
                      ? "Salva Modifiche"
                      : "Crea Prenotazione"}
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
