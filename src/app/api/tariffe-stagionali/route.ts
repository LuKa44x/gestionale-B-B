import { NextResponse } from "next/server";
import pool from "@/lib/db";

// /api/tariffe-stagionali GET
// Richiesta
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT ts.*, c.nome_numero AS camera_nome
      FROM tariffe_stagionali ts
      LEFT JOIN camere c ON ts.id_camera = c.id_camera
      ORDER BY ts.data_inizio ASC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero tariffe", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
// /api/tariffe-stagionali POST
// Aggiungi
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_camera, nome, tipo, data_inizio, data_fine, prezzo_per_notte } =
      body;

    if (new Date(data_fine) <= new Date(data_inizio)) {
      return NextResponse.json(
        { errore: "La data fine deve essere successiva alla data inizio" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO tariffe_stagionali
        (id_camera, nome, tipo, data_inizio, data_fine, prezzo_per_notte)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [id_camera || null, nome, tipo, data_inizio, data_fine, prezzo_per_notte],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella creazione tariffa", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
