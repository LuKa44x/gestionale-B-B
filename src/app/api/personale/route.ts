import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/personale
// lista di tutti i dipendenti
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM personale ORDER BY cognome ASC, nome ASC",
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero del personale", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/personale
// crea un nuovo dipendente
export async function POST(request: Request) {
  try {
    // recupero dati dal frontend
    const body = await request.json();
    // estraggo i campi dal body
    const {
      nome,
      cognome,
      ruolo,
      telefono,
      email,
      stipendio,
      data_assunzione,
    } = body;
    // creo la query per inserire un nuovo dipendente, con i campi recuperati dal body
    const result = await pool.query(
      `INSERT INTO personale (nome, cognome, ruolo, telefono, email, stipendio, data_assunzione)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        nome,
        cognome,
        ruolo,
        telefono || null,
        email || null,
        stipendio,
        data_assunzione,
      ],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella creazione del dipendente",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
