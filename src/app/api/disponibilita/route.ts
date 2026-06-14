import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/disponibilita
// Questo endpoint restituisce le camere disponibili per un intervallo di date specificato
export async function GET(request: Request) {
  try {
    // Estrai i parametri di query
    const { searchParams } = new URL(request.url);
    // I parametri attesi sono:
    // - checkin: data di check-in (YYYY-MM-DD)
    // - checkout: data di check-out (YYYY-MM-DD)
    // - escludi: id_prenotazione da escludere (opzionale, utile per modifiche)
    const checkin = searchParams.get("checkin");
    const checkout = searchParams.get("checkout");
    const escludiPrenotazione = searchParams.get("escludi");

    // Verifica che le date siano state fornite
    if (!checkin || !checkout) {
      return NextResponse.json(
        { errore: "Le date di check-in e check-out sono obbligatorie" },
        { status: 400 },
      );
    }

    // Verifica che il checkout sia dopo il checkin
    if (new Date(checkout) <= new Date(checkin)) {
      return NextResponse.json(
        { errore: "Il check-out deve essere successivo al check-in" },
        { status: 400 },
      );
    }

    // Query per trovare camere NON occupate nel periodo richiesto
    // Una camera è occupata se esiste una prenotazione che si sovrappone
    // La sovrapposizione esiste quando:
    //   data_checkin della prenotazione esistente < checkout richiesto
    //   AND data_checkout della prenotazione esistente > checkin richiesto

    //  COALESCE qui:
    //  Prova prima a trovare una tariffa stagionale applicabile. Se non ne trova nessuna, usa prezzo_base_notte.
    //  La clausola ORDER BY ts.id_camera DESC NULLS LAST dà priorità alle tariffe specifiche
    //  per camera rispetto a quelle globali
    let query = `
  SELECT
    c.*,
    COALESCE(
      (SELECT ts.prezzo_per_notte
       FROM tariffe_stagionali ts
       WHERE (ts.id_camera = c.id_camera OR ts.id_camera IS NULL)
       AND ts.data_inizio <= $2
       AND ts.data_fine >= $1
       ORDER BY ts.id_camera DESC NULLS LAST
       LIMIT 1),
      c.prezzo_base_notte
    ) AS prezzo_effettivo
  FROM camere c
  WHERE id_camera NOT IN (
    SELECT id_camera FROM prenotazioni
    WHERE stato NOT IN ('Annullata', 'No-show')
    AND data_checkin < $2
    AND data_checkout > $1
    ${escludiPrenotazione ? "AND id_prenotazione != $3" : ""}
  )
  AND stato != 'In manutenzione'
  ORDER BY tipologia, nome_numero
`;
    // I parametri per la query
    const params = escludiPrenotazione
      ? [checkin, checkout, escludiPrenotazione]
      : [checkin, checkout];

    // Esegui la query e restituisci i risultati
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel controllo disponibilità",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
