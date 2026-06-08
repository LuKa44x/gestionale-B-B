import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/servizi_extra
// lista di tutti i servizi extra
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM servizi_extra ORDER BY nome_servizio ASC",
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero dei servizi", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/servizi_extra
// crea un nuovo servizio extra
export async function POST(request: Request) {
  try {
    // recupero dati dal frontend
    const body = await request.json();
    // estraggo i campi dal body
    const { nome_servizio, descrizione, costo, unita_misura } = body;

    // creo la query per inserire un nuovo servizio extra, con i campi recuperati dal body
    const result = await pool.query(
      `INSERT INTO servizi_extra (nome_servizio, descrizione, costo, unita_misura)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [nome_servizio, descrizione || null, costo, unita_misura],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella creazione del servizio",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
