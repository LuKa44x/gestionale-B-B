import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const [prenotazione, servizi, pagamenti, impostazioni] = await Promise.all([
      pool.query(
        `
        SELECT
          p.*,
          o.nome AS ospite_nome, o.cognome AS ospite_cognome,
          o.tipo_documento, o.numero_documento, o.nazionalita,
          o.email AS ospite_email, o.telefono AS ospite_telefono,
          c.nome_numero AS camera_nome, c.tipologia AS camera_tipologia,
          c.prezzo_base_notte,
          s.codice AS sconto_codice, s.tipo AS sconto_tipo, s.valore AS sconto_valore
        FROM prenotazioni p
        JOIN ospiti o ON p.id_ospite = o.id_ospite
        JOIN camere c ON p.id_camera = c.id_camera
        LEFT JOIN sconti s ON p.id_sconto = s.id_sconto
        WHERE p.id_prenotazione = $1
      `,
        [id],
      ),

      pool.query(
        `
        SELECT dp.quantita, dp.prezzo_finale, se.nome_servizio, se.unita_misura
        FROM dettagli_prenotazione dp
        JOIN servizi_extra se ON dp.id_servizio = se.id_servizio
        WHERE dp.id_prenotazione = $1
      `,
        [id],
      ),

      pool.query(
        `
        SELECT * FROM cassa
        WHERE id_prenotazione = $1
        ORDER BY data_ora_pagamento ASC
      `,
        [id],
      ),

      pool.query(`SELECT * FROM impostazioni`),
    ]);

    if (prenotazione.rows.length === 0) {
      return NextResponse.json(
        { errore: "Prenotazione non trovata" },
        { status: 404 },
      );
    }

    const impostazioniObj = impostazioni.rows.reduce(
      (obj, row) => {
        obj[row.chiave] = row.valore;
        return obj;
      },
      {} as Record<string, string>,
    );

    const p = prenotazione.rows[0];
    const notti = Math.ceil(
      (new Date(p.data_checkout).getTime() -
        new Date(p.data_checkin).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return NextResponse.json({
      prenotazione: p,
      notti,
      servizi: servizi.rows,
      pagamenti: pagamenti.rows,
      impostazioni: impostazioniObj,
      totale_pagato: pagamenti.rows
        .filter((p: any) => p.tipo !== "Rimborso")
        .reduce((sum: number, p: any) => sum + parseFloat(p.importo), 0),
    });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero dati ricevuta", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
