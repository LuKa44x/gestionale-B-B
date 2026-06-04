import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/camere
// lista tutte le camere
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM camere ORDER BY id_camera ASC",
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero delle camere", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/camere
// crea nuova camera
export async function POST(request: Request) {
  try {
    //recupero dati dal frontend
    const body = await request.json();
    //questo sotto uguale a --> const nome_numero = body.nome_numero; const tipologia = body.tipologia; etc. ( DESTRUTTURAZIONE )
    const {
      nome_numero,
      tipologia,
      capienza_max,
      prezzo_base_notte,
      descrizione,
      servizi_inclusi,
      stato,
    } = body;

    //query per inserire nuova camera nel database
    // $1, $2, etc. sono i placeholder per i valori che vengono passati come array dopo la query
    // $1 corrisponde a nome_numero, $2 a tipologia, etc.
    // avoiding sql injection
    const result = await pool.query(
      `INSERT INTO camere 
        (nome_numero, tipologia, capienza_max, prezzo_base_notte, descrizione, servizi_inclusi, stato)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        nome_numero,
        tipologia,
        capienza_max,
        prezzo_base_notte,
        descrizione,
        servizi_inclusi,
        stato,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella creazione della camera",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
