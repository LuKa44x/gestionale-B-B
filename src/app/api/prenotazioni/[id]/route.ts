import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/prenotazioni/[id]
// prenotazione di una specifica camera con servizi
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Estraiamo l'id dalla route
  const { id } = await params;
  try {
    // Prenotazione con dati ospite e camera
    const prenotazione = await pool.query(
      `SELECT
        p.*,
        o.nome AS ospite_nome, o.cognome AS ospite_cognome,
        o.telefono AS ospite_telefono, o.email AS ospite_email,
        c.nome_numero AS camera_nome, c.tipologia AS camera_tipologia,
        c.prezzo_base_notte
       FROM prenotazioni p
       JOIN ospiti o ON p.id_ospite = o.id_ospite
       JOIN camere c ON p.id_camera = c.id_camera
       WHERE p.id_prenotazione = $1`,
      [id],
    );
    // Se non troviamo la prenotazione, rispondiamo con 404
    if (prenotazione.rows.length === 0) {
      return NextResponse.json(
        { errore: "Prenotazione non trovata" },
        { status: 404 },
      );
    }

    // query dei servizi extra associati a questa prenotazione
    const servizi = await pool.query(
      `SELECT dp.*, se.nome_servizio, se.unita_misura
       FROM dettagli_prenotazione dp
       JOIN servizi_extra se ON dp.id_servizio = se.id_servizio
       WHERE dp.id_prenotazione = $1`,
      [id],
    );

    return NextResponse.json({
      ...prenotazione.rows[0],
      servizi: servizi.rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel recupero della prenotazione",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// PUT /api/prenotazioni/[id]
// modifica prenotazione
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Estraiamo l'id dalla route
  const { id } = await params;
  // client per la transazione
  const client = await pool.connect();

  try {
    // Estraiamo i dati dal body della richiesta
    const body = await request.json();
    const {
      id_ospite,
      id_camera,
      data_checkin,
      data_checkout,
      numero_ospiti,
      canale,
      note_prenotazione,
      servizi,
    } = body;

    // Verifica disponibilità escludendo questa prenotazione
    const disponibilita = await client.query(
      `SELECT id_camera FROM prenotazioni
       WHERE id_camera = $1
       AND id_prenotazione != $4  -- (Escludiamo la prenotazione che stiamo modificando)
       AND stato NOT IN ('Annullata', 'No-show')
       AND data_checkin < $3
       AND data_checkout > $2`,
      [id_camera, data_checkin, data_checkout, id],
    );
    // Se la camera non è disponibile, rispondiamo con un errore
    if (disponibilita.rows.length > 0) {
      return NextResponse.json(
        { errore: "Camera non disponibile nel periodo selezionato" },
        { status: 409 },
      );
    }
    // Inizia la transazione
    await client.query("BEGIN");

    // Aggiorna prenotazione
    const prenotazione = await client.query(
      `UPDATE prenotazioni SET
        id_ospite=$1, id_camera=$2, data_checkin=$3, data_checkout=$4,
        numero_ospiti=$5, canale=$6, note_prenotazione=$7
       WHERE id_prenotazione=$8
       RETURNING *`,
      [
        id_ospite,
        id_camera,
        data_checkin,
        data_checkout,
        numero_ospiti,
        canale,
        note_prenotazione || null,
        id,
      ],
    );
    // Se la prenotazione non esiste, rollback e 404
    if (prenotazione.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { errore: "Prenotazione non trovata" },
        { status: 404 },
      );
    }

    // Elimina vecchi servizi e reinserisci i nuovi
    await client.query(
      "DELETE FROM dettagli_prenotazione WHERE id_prenotazione = $1",
      [id],
    );
    // Inserire i servizi extra (se presenti)
    if (servizi && servizi.length > 0) {
      for (const servizio of servizi) {
        await client.query(
          `INSERT INTO dettagli_prenotazione
            (id_prenotazione, id_servizio, quantita, prezzo_finale)
           VALUES ($1,$2,$3,$4)`,
          [id, servizio.id_servizio, servizio.quantita, servizio.prezzo_finale],
        );
      }
    }
    // Tutto ok, conferma la transazione
    await client.query("COMMIT");
    return NextResponse.json(prenotazione.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      {
        errore: "Errore nella modifica della prenotazione",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

// DELETE /api/prenotazioni/[id]
// annulla prenotazione
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Estraiamo l'id dalla route
  const { id } = await params;
  try {
    // Non si elimina fisicamente — cambio lo stato in annullata
    // per preservare lo storico delle prenotazioni
    const result = await pool.query(
      `UPDATE prenotazioni
       SET stato = 'Annullata'
       WHERE id_prenotazione = $1
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Prenotazione non trovata" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      messaggio: "Prenotazione annullata con successo",
    });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nell'annullamento della prenotazione",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
