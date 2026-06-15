"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type RicevutaData = {
  prenotazione: any;
  notti: number;
  servizi: any[];
  pagamenti: any[];
  impostazioni: Record<string, string>;
  totale_pagato: number;
};

export default function RicevutaPage() {
  const params = useParams();
  const [data, setData] = useState<RicevutaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prenotazioni/${params.id}/ricevuta`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [params.id]);

  if (loading)
    return (
      <div className="container mt-4">
        <p>Caricamento ricevuta...</p>
      </div>
    );
  if (!data || data.prenotazione?.errore)
    return (
      <div className="container mt-4">
        <p>Ricevuta non trovata.</p>
      </div>
    );

  const { prenotazione: p, notti, servizi, pagamenti, totale_pagato } = data;

  const importoCamera = parseFloat(p.prezzo_base_notte) * notti;
  const importoServizi = servizi.reduce(
    (sum, s) => sum + parseFloat(s.prezzo_finale),
    0,
  );
  const tassa = parseFloat(p.tassa_soggiorno) || 0;
  const sconto = parseFloat(p.sconto_applicato) || 0;
  const totale = importoCamera + importoServizi + tassa - sconto;

  const dataOggi = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12px; }
          .container { max-width: 100%; }
        }
      `}</style>

      {/* Bottone stampa — nascosto in stampa */}
      <div className="no-print d-flex justify-content-end p-3 bg-light border-bottom">
        <button className="btn btn-primary me-2" onClick={() => window.print()}>
          🖨️ Stampa / Salva PDF
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => window.close()}
        >
          ✕ Chiudi
        </button>
      </div>

      <div className="container mt-4" style={{ maxWidth: "800px" }}>
        {/* INTESTAZIONE */}
        <div className="row mb-4 pb-3 border-bottom">
          <div className="col-8">
            <h2 className="fw-bold mb-1">🏨 Gestionale B&B</h2>
            <p className="text-secondary mb-0 small">
              Via Roma 1 — 90100 Palermo (PA)
            </p>
            <p className="text-secondary mb-0 small">
              info@notreal.it — +39 091 000000
            </p>
          </div>
          <div className="col-4 text-end">
            <h4 className="fw-bold text-primary">RICEVUTA</h4>
            <p className="mb-0 small">
              N° {p.id_prenotazione}/{new Date().getFullYear()}
            </p>
            <p className="mb-0 small">Data: {dataOggi}</p>
          </div>
        </div>

        {/* DATI OSPITE */}
        <div className="row mb-4">
          <div className="col-6">
            <h6 className="fw-bold text-secondary text-uppercase small mb-2">
              Intestatario
            </h6>
            <p className="mb-0 fw-bold">
              {p.ospite_cognome} {p.ospite_nome}
            </p>
            {p.ospite_email && <p className="mb-0 small">{p.ospite_email}</p>}
            {p.ospite_telefono && (
              <p className="mb-0 small">{p.ospite_telefono}</p>
            )}
            <p className="mb-0 small text-secondary">
              {p.tipo_documento}: {p.numero_documento} — {p.nazionalita}
            </p>
          </div>
          <div className="col-6">
            <h6 className="fw-bold text-secondary text-uppercase small mb-2">
              Dettagli soggiorno
            </h6>
            <p className="mb-0 small">
              <strong>Camera:</strong> {p.camera_nome} ({p.camera_tipologia})
            </p>
            <p className="mb-0 small">
              <strong>Check-in:</strong> {p.data_checkin}
            </p>
            <p className="mb-0 small">
              <strong>Check-out:</strong> {p.data_checkout}
            </p>
            <p className="mb-0 small">
              <strong>Notti:</strong> {notti}
            </p>
            <p className="mb-0 small">
              <strong>Ospiti:</strong> {p.numero_ospiti}
            </p>
            <p className="mb-0 small">
              <strong>Canale:</strong> {p.canale}
            </p>
          </div>
        </div>

        {/* DETTAGLIO COSTI */}
        <h6 className="fw-bold text-secondary text-uppercase small mb-2">
          Dettaglio costi
        </h6>
        <table className="table table-sm border mb-4">
          <thead className="table-light">
            <tr>
              <th>Descrizione</th>
              <th className="text-end">Importo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Camera {p.camera_nome} — {notti} notte/i × €
                {parseFloat(p.prezzo_base_notte).toFixed(2)}
              </td>
              <td className="text-end">€ {importoCamera.toFixed(2)}</td>
            </tr>

            {servizi.map((s, i) => (
              <tr key={i}>
                <td>
                  {s.nome_servizio} × {s.quantita}
                  <span className="text-secondary small ms-1">
                    ({s.unita_misura})
                  </span>
                </td>
                <td className="text-end">
                  € {parseFloat(s.prezzo_finale).toFixed(2)}
                </td>
              </tr>
            ))}

            <tr>
              <td>
                Tassa di soggiorno
                {p.ospiti_esenti > 0 && (
                  <span className="text-secondary small ms-1">
                    ({p.numero_ospiti - p.ospiti_esenti} ospiti paganti ×{" "}
                    {notti} notti)
                  </span>
                )}
              </td>
              <td className="text-end">€ {tassa.toFixed(2)}</td>
            </tr>

            {sconto > 0 && (
              <tr className="text-success">
                <td>
                  Sconto
                  {p.sconto_codice && (
                    <span className="ms-1">({p.sconto_codice})</span>
                  )}
                </td>
                <td className="text-end">- € {sconto.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="fw-bold">
              <td className="border-top border-2">Totale</td>
              <td className="text-end border-top border-2">
                € {totale.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* PAGAMENTI */}
        {pagamenti.length > 0 && (
          <>
            <h6 className="fw-bold text-secondary text-uppercase small mb-2">
              Pagamenti ricevuti
            </h6>
            <table className="table table-sm border mb-4">
              <thead className="table-light">
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Metodo</th>
                  <th className="text-end">Importo</th>
                </tr>
              </thead>
              <tbody>
                {pagamenti.map((pg, i) => (
                  <tr key={i}>
                    <td className="small">
                      {new Date(pg.data_ora_pagamento).toLocaleDateString(
                        "it-IT",
                      )}
                    </td>
                    <td>{pg.tipo}</td>
                    <td>{pg.metodo_pagamento}</td>
                    <td
                      className={`text-end ${pg.tipo === "Rimborso" ? "text-danger" : ""}`}
                    >
                      {pg.tipo === "Rimborso" ? "- " : ""}€{" "}
                      {parseFloat(pg.importo).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan={3} className="border-top">
                    Totale pagato
                  </td>
                  <td className="text-end border-top">
                    € {totale_pagato.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}

        {/* SALDO */}
        <div
          className={`alert ${totale - totale_pagato <= 0 ? "alert-success" : "alert-warning"} mb-4`}
        >
          {totale - totale_pagato <= 0 ? (
            <strong>✅ Pagamento completato — Saldo: € 0,00</strong>
          ) : (
            <strong>
              ⚠️ Saldo rimanente: € {(totale - totale_pagato).toFixed(2)}
            </strong>
          )}
        </div>

        {/* PIÈ DI PAGINA */}
        <div className="text-center text-secondary small mt-4 pt-3 border-top">
          <p className="mb-0">Documento non fiscale — Gestionale B&B</p>
          <p className="mb-0">Generato il {dataOggi}</p>
        </div>
      </div>
    </>
  );
}
