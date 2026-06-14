import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM sconti ORDER BY codice ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero sconti", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codice, descrizione, tipo, valore, data_scadenza } = body;

    const result = await pool.query(
      `INSERT INTO sconti (codice, descrizione, tipo, valore, data_scadenza)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        codice.toUpperCase(),
        descrizione || null,
        tipo,
        valore,
        data_scadenza || null,
      ],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { errore: "Codice sconto già esistente" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { errore: "Errore nella creazione sconto", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
