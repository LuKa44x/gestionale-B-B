import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/ospiti?search=mario
// lista ospiti con ricerca
export async function GET(request: Request) {
  try {
    // searchParams é un query parameter, dopo il ? nell'url (search=mario)
    const { searchParams } = new URL(request.url);
    // recupera il valore associato a search (mario)
    const search = searchParams.get("search");
    // ricerca tutti gli ospiti e salva nella variabile query
    let query = "SELECT * FROM ospiti";
    let params: string[] = [];
    // Se è presente un termine di ricerca, ricerca solo dove nome, cognome, telefono,
    // numero_documento o nazionalità contengono il termine
    if (search) {
      query += ` WHERE
        nome ILIKE $1 OR
        cognome ILIKE $1 OR
        telefono ILIKE $1 OR
        numero_documento ILIKE $1 OR
        nazionalita ILIKE $1`;
      params = [`%${search}%`];
    }
    // Ordina sempre per cognome e nome ASC
    query += " ORDER BY cognome ASC, nome ASC";
    // esegui la query, ordinata e con il filtro di ricerca se presente
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero degli ospiti", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// POST /api/ospiti
// crea nuovo ospite
export async function POST(request: Request) {
  try {
    // recupero i dati dal frontend
    const body = await request.json();
    // estraggo i campi dal body
    const {
      nome,
      cognome,
      tipo_documento,
      numero_documento,
      nazionalita,
      telefono,
      email,
      data_nascita,
      indirizzo,
      note,
    } = body;
    // creo la query per inserire un nuovo ospite, con i campi recuperati dal body
    const result = await pool.query(
      `INSERT INTO ospiti
    (nome, cognome, tipo_documento, numero_documento,
     nazionalita, telefono, email, data_nascita, indirizzo, note)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
   RETURNING *`,
      [
        nome,
        cognome,
        tipo_documento,
        numero_documento,
        nazionalita,
        telefono || null,
        email || null,
        data_nascita || null,
        indirizzo || null,
        note || null,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nella creazione dell'ospite",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
