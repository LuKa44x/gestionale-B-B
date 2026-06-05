import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/personale/[id]
// recupera dipendente per id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero il dipendente con quell'id dal database
    const result = await pool.query(
      "SELECT * FROM personale WHERE id_dipendente = $1",
      [id],
    );
    // se non viene trovato il dipendente con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Dipendente non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel recupero del dipendente",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// PUT /api/personale/[id]
// modifica dipendente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero i dati del dipendente da modificare dal body della richiesta
    const body = await request.json();
    const {
      nome,
      cognome,
      ruolo,
      telefono,
      email,
      stipendio,
      data_assunzione,
    } = body;
    // modifico il dipendente con quell'id nel database
    const result = await pool.query(
      `UPDATE personale SET
        nome=$1, cognome=$2, ruolo=$3, telefono=$4,
        email=$5, stipendio=$6, data_assunzione=$7
       WHERE id_dipendente=$8
       RETURNING *`,
      [
        nome,
        cognome,
        ruolo,
        telefono || null,
        email || null,
        stipendio,
        data_assunzione,
        id,
      ],
    );
    // se non viene trovato il dipendente con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Dipendente non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella modifica del dipendente",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}

// DELETE /api/personale/[id]
// elimina dipendente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // query che elimina il dipendente con quell'id dal database
    const result = await pool.query(
      "DELETE FROM personale WHERE id_dipendente = $1 RETURNING *",
      [id],
    );
    // se non viene trovato il dipendente con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Dipendente non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      messaggio: "Dipendente eliminato con successo",
    });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nell'eliminazione del dipendente",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
