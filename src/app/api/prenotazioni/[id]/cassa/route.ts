import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/prenotazioni/[id]/cassa
// pagamenti di una prenotazione
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // query
    const result = await pool.query(
      `SELECT * FROM cassa
       WHERE id_prenotazione = $1
       ORDER BY data_ora_pagamento ASC`,
      [id],
    );

    //
    const totPagato = result.rows
      .filter((r) => r.tipo !== "Rimborso")
      .reduce((sum, r) => sum + parseFloat(r.importo), 0);

    //
    const totRimborsi = result.rows
      .filter((r) => r.tipo === "Rimborso")
      .reduce((sum, r) => sum + parseFloat(r.importo), 0);

    return NextResponse.json({
      pagamenti: result.rows,
      totale_pagato: Math.round(totPagato * 100) / 100,
      totale_rimborsi: Math.round(totRimborsi * 100) / 100,
      saldo_netto: Math.round((totPagato - totRimborsi) * 100) / 100,
    });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero pagamenti", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/prenotazioni/[id]/cassa
// aggiungi pagamento
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // recupero id dalla richiesta
  const { id } = await params;
  try {
    const body = await request.json();
    const { tipo, importo, metodo_pagamento } = body;

    //validazione
    if (!tipo || !importo || !metodo_pagamento) {
      return NextResponse.json(
        { errore: "Tipo, importo e metodo pagamento sono obbligatori" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO cassa (id_prenotazione, tipo, importo, metodo_pagamento)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, tipo, importo, metodo_pagamento],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel registrare il pagamento",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
