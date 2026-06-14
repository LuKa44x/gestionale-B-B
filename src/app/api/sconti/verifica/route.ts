import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/sconti/verifica?codice=PROMO20
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codice = searchParams.get("codice");

    if (!codice) {
      return NextResponse.json({ errore: "Codice mancante" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT * FROM sconti
       WHERE codice = $1
       AND attivo = TRUE
       AND (data_scadenza IS NULL OR data_scadenza > CURRENT_DATE - INTERVAL '1 day')`,
      [codice.toUpperCase()],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Codice sconto non valido o scaduto" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella verifica", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
