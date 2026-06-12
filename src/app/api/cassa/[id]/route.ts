import { NextResponse } from "next/server";
import pool from "@/lib/db";

// DELETE /api/cassa/[id]
// elimina transazione
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // query
    const result = await pool.query(
      "DELETE FROM cassa WHERE id_transazione = $1 RETURNING *",
      [id],
    );
    // se non trovata
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Transazione non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Transazione eliminata" });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella eliminazione", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
