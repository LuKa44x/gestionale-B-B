import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/servizi-extra/[id]
// recupera servizio extra per id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero il servizio extra con quell'id dal database
    const result = await pool.query(
      "SELECT * FROM servizi_extra WHERE id_servizio = $1",
      [id],
    );
    // se non viene trovato il servizio extra con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Servizio non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero del servizio", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// PUT /api/servizi-extra/[id]
// modifica servizio extra
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero i dati del servizio extra da modificare dal body della richiesta
    const body = await request.json();
    const { nome_servizio, descrizione, costo, unita_misura } = body;

    // modifico il servizio extra con quell'id nel database
    const result = await pool.query(
      `UPDATE servizi_extra SET
        nome_servizio=$1, descrizione=$2, costo=$3, unita_misura=$4
       WHERE id_servizio=$5
       RETURNING *`,
      [nome_servizio, descrizione || null, costo, unita_misura, id],
    );
    // se non viene trovato il servizio extra con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Servizio non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella modifica del servizio",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE /api/servizi-extra/[id]
// elimina servizio extra
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // elimino il servizio extra con quell'id dal database
    const result = await pool.query(
      "DELETE FROM servizi_extra WHERE id_servizio = $1 RETURNING *",
      [id],
    );
    // se non viene trovato il servizio extra con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Servizio non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Servizio eliminato con successo" });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nell'eliminazione del servizio",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
