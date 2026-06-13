import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/prenotazioni
// recupera prenotazioni con filtri opzionali
export async function GET(request: Request) {
  try {
    // Estraiamo i parametri di ricerca dalla query string
    const { searchParams } = new URL(request.url);
    // I parametri sono opzionali, se non presenti non filtrano i risultati
    // stato: Confermata, Annullata, No-show
    // ospite: ID numerico dell'ospite
    // canale: Booking, Expedia, Diretto, etc.
    const stato = searchParams.get("stato");
    const idOspite = searchParams.get("ospite");
    const canale = searchParams.get("canale");

    // JOIN: uniamo prenotazioni con ospiti e camere
    // così riceviamo nome/cognome ospite e nome camera
    // invece dei soli ID numerici
    let query = `
      SELECT
        p.*,
        o.nome        AS ospite_nome,
        o.cognome     AS ospite_cognome,
        o.telefono    AS ospite_telefono,
        c.nome_numero AS camera_nome,
        c.tipologia   AS camera_tipologia
      FROM prenotazioni p
      JOIN ospiti  o ON p.id_ospite = o.id_ospite
      JOIN camere  c ON p.id_camera = c.id_camera
      WHERE 1=1
    `;

    // query dinamica: aggiungo condizioni solo se i parametri sono presenti
    const params: (string | number)[] = [];
    let i = 1;
    // Se stato è presente, aggiungiamo la condizione alla query
    if (stato) {
      query += ` AND p.stato = $${i++}`;
      params.push(stato);
    }
    // Se idOspite è presente, filtriamo per quell'ospite specifico
    if (idOspite) {
      query += ` AND p.id_ospite = $${i++}`;
      params.push(idOspite);
    }
    // Se canale è presente, filtriamo per quel canale specifico
    if (canale) {
      query += ` AND p.canale = $${i++}`;
      params.push(canale);
    }

    query += " ORDER BY p.data_checkin DESC";

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel recupero delle prenotazioni",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// POST /api/prenotazioni
// crea nuova prenotazione
export async function POST(request: Request) {
  // client per la 'transazione'
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
      servizi, // array: [{ id_servizio, quantita, prezzo_finale }]
    } = body;

    // Verifica disponibilità camera
    const disponibilita = await client.query(
      `SELECT id_camera FROM prenotazioni
       WHERE id_camera = $1
       AND stato NOT IN ('Annullata', 'No-show')
       AND data_checkin < $3
       AND data_checkout > $2`,
      [id_camera, data_checkin, data_checkout],
    );

    // Se true, significa che la camera è già prenotata in quel periodo
    if (disponibilita.rows.length > 0) {
      return NextResponse.json(
        { errore: "Camera non disponibile nel periodo selezionato" },
        { status: 409 }, // 409 Conflict
      );
    }

    // Inizia la transazione
    // Se qualcosa va storto, tutto viene annullato
    await client.query("BEGIN");

    // Crea la prenotazione principale
    const prenotazione = await client.query(
      `INSERT INTO prenotazioni
    (id_ospite, id_camera, data_checkin, data_checkout,
     numero_ospiti, stato, canale, note_prenotazione,
     tassa_soggiorno, ospiti_esenti)
   VALUES ($1,$2,$3,$4,$5,'Confermata',$6,$7,$8,$9)
   RETURNING *`,
      [
        id_ospite,
        id_camera,
        data_checkin,
        data_checkout,
        numero_ospiti,
        canale || "Diretto",
        note_prenotazione || null,
        body.tassa_soggiorno || 0,
        body.ospiti_esenti || 0,
      ],
    );

    // ID della prenotazione appena creata
    const idPrenotazione = prenotazione.rows[0].id_prenotazione;

    // Inserire i servizi extra (se presenti)
    if (servizi && servizi.length > 0) {
      for (const servizio of servizi) {
        await client.query(
          `INSERT INTO dettagli_prenotazione
            (id_prenotazione, id_servizio, quantita, prezzo_finale)
           VALUES ($1,$2,$3,$4)`,
          [
            idPrenotazione,
            servizio.id_servizio,
            servizio.quantita,
            servizio.prezzo_finale,
          ],
        );
      }
    }

    // Tutto ok
    // conferma la transazione
    await client.query("COMMIT");

    return NextResponse.json(prenotazione.rows[0], { status: 201 });
  } catch (error) {
    // Qualcosa è andato storto, annulla tutto
    await client.query("ROLLBACK");
    return NextResponse.json(
      {
        errore: "Errore nella creazione della prenotazione",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  } finally {
    // Rilascia sempre il client al pool
    client.release();
  }
}
