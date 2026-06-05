import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/ospiti/[id]
// recupera ospite per id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero l'ospite con quell'id dal database
    const result = await pool.query(
      "SELECT * FROM ospiti WHERE id_ospite = $1",
      [id],
    );
    // se non viene trovato l'ospite con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Ospite non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero dell'ospite", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// PUT /api/ospiti/[id]
// modifica ospite
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // recupero i dati dell'ospite da modificare dal body della richiesta
    const body = await request.json();
    const {
      nome,
      cognome,
      tipo_documento,
      numero_documento,
      nazionalita,
      telefono,
      email,
      data_nascita,
      indirizzo,
      note,
    } = body;
    // modifico l'ospite con quell'id nel database
    const result = await pool.query(
      `UPDATE ospiti SET
        nome=$1, cognome=$2, tipo_documento=$3, numero_documento=$4,
        nazionalita=$5, telefono=$6, email=$7, data_nascita=$8,
        indirizzo=$9, note=$10
       WHERE id_ospite=$11
       RETURNING *`,
      [
        nome,
        cognome,
        tipo_documento,
        numero_documento,
        nazionalita,
        telefono || null,
        email || null,
        data_nascita || null,
        indirizzo || null,
        note || null,
        id,
      ],
    );
    // se non viene trovato l'ospite con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Ospite non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella modifica dell'ospite", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// DELETE /api/ospiti/[id]
// elimina ospite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // estraggo l'id dalla richiesta
  const { id } = await params;
  try {
    // query che elimina l'ospite con quell'id dal database
    const result = await pool.query(
      "DELETE FROM ospiti WHERE id_ospite = $1 RETURNING *",
      [id],
    );
    // se non viene trovato l'ospite con quell'id, restituisco un errore 404
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Ospite non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Ospite eliminato con successo" });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nell'eliminazione dell'ospite",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
