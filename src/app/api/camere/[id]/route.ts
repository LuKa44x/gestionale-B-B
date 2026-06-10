import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/camere/[id]
// dettagli singola camera
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  //estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero la camera con quell'id dal database
    const result = await pool.query(
      "SELECT * FROM camere WHERE id_camera = $1",
      [id],
    );
    //se non viene trovata la camera con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Camera non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero della camera", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// PUT /api/camere/[id]
// modifica camera
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  //estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    //recupero i dati della camera da modificare dal body della richiesta
    const body = await request.json();
    const {
      nome_numero,
      tipologia,
      capienza_max,
      prezzo_base_notte,
      descrizione,
      servizi_inclusi,
      stato,
    } = body;
    //modifico la camera con quell'id nel database
    const result = await pool.query(
      `UPDATE camere SET
        nome_numero = $1, tipologia = $2, capienza_max = $3,
        prezzo_base_notte = $4, descrizione = $5,
        servizi_inclusi = $6, stato = $7
       WHERE id_camera = $8
       RETURNING *`,
      [
        nome_numero,
        tipologia,
        capienza_max,
        prezzo_base_notte,
        descrizione,
        servizi_inclusi,
        stato,
        id,
      ],
    );
    //se non viene trovata la camera con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Camera non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella modifica della camera",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE /api/camere/[id]
// elimina camera
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  //estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    //query che elimina la camera con quell'id dal database
    const result = await pool.query(
      "DELETE FROM camere WHERE id_camera = $1 RETURNING *",
      [id],
    );
    //se non viene trovata la camera con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Camera non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Camera eliminata con successo" });
  } catch (error: any) {
    // Codice 23503 = violazione Foreign Key
    // sta cercando di eliminare un record che è ancora referenziato da un'altra tabella
    if (error.code === "23503") {
      return NextResponse.json(
        { errore: "Impossibile eliminare: esistono prenotazioni collegate." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { errore: "Errore nell'eliminazione", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
