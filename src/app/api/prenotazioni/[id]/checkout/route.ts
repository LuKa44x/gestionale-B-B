import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Funzione per gestire la richiesta PUT per il check-out di una prenotazione
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Estrae l'id della prenotazione dai parametri
  const { id } = await params;
  try {
    // Verifica che la prenotazione sia in stato 'Check-in effettuato'
    const check = await pool.query(
      "SELECT stato FROM prenotazioni WHERE id_prenotazione = $1",
      [id],
    );
    // Se la prenotazione non esiste, restituisce un errore 404
    if (check.rows.length === 0) {
      return NextResponse.json(
        { errore: "Prenotazione non trovata" },
        { status: 404 },
      );
    }
    // Se lo stato attuale non è 'Check-in effettuato', restituisce un errore 400
    if (check.rows[0].stato !== "Check-in effettuato") {
      return NextResponse.json(
        {
          errore: `Impossibile fare check-out: stato attuale è "${check.rows[0].stato}"`,
        },
        { status: 400 },
      );
    }
    // Aggiorna lo stato della prenotazione a 'Check-out effettuato' e restituisce i dati aggiornati
    const result = await pool.query(
      `UPDATE prenotazioni
       SET stato = 'Check-out effettuato'
       WHERE id_prenotazione = $1
       RETURNING *`,
      [id],
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore durante il check-out", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
