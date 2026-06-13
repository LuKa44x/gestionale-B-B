import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/impostazioni
// tutte le impostazioni
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM impostazioni");
    // Convertiamo l'array in oggetto { chiave: valore }
    const impostazioni = result.rows.reduce(
      (obj, row) => {
        obj[row.chiave] = row.valore;
        return obj;
      },
      {} as Record<string, string>,
    );
    return NextResponse.json(impostazioni);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero impostazioni", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// PUT /api/impostazioni
// aggiorna un'impostazione
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { chiave, valore } = body;

    // è una funzionalità PostgreSQL chiamata UPSERT —
    // inserisce il record se non esiste, lo aggiorna se esiste già
    await pool.query(
      `INSERT INTO impostazioni (chiave, valore)
       VALUES ($1, $2)
       ON CONFLICT (chiave) DO UPDATE SET valore = $2`,
      [chiave, valore],
    );

    return NextResponse.json({ messaggio: "Impostazione aggiornata" });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore aggiornamento impostazione", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
