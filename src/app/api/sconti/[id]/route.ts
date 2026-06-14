import { NextResponse } from "next/server";
import pool from "@/lib/db";

// MODIFICA
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { codice, descrizione, tipo, valore, data_scadenza, attivo } = body;

    const result = await pool.query(
      `UPDATE sconti SET
        codice=$1, descrizione=$2, tipo=$3,
        valore=$4, data_scadenza=$5, attivo=$6
       WHERE id_sconto=$7 RETURNING *`,
      [
        codice.toUpperCase(),
        descrizione || null,
        tipo,
        valore,
        data_scadenza || null,
        attivo,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Sconto non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella modifica sconto", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// ELIMINA
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await pool.query(
      "DELETE FROM sconti WHERE id_sconto=$1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Sconto non trovato" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Sconto eliminato" });
  } catch (error: any) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          errore:
            "Impossibile eliminare: sconto già utilizzato in prenotazioni",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { errore: "Errore eliminazione sconto", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
