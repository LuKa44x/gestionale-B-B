import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Modifica
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { id_camera, nome, tipo, data_inizio, data_fine, prezzo_per_notte } =
      body;

    const result = await pool.query(
      `UPDATE tariffe_stagionali SET
        id_camera=$1, nome=$2, tipo=$3,
        data_inizio=$4, data_fine=$5, prezzo_per_notte=$6
       WHERE id_tariffa=$7 RETURNING *`,
      [
        id_camera || null,
        nome,
        tipo,
        data_inizio,
        data_fine,
        prezzo_per_notte,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Tariffa non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nella modifica tariffa", dettaglio: String(error) },
      { status: 500 },
    );
  }
}

// DELETE
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await pool.query(
      "DELETE FROM tariffe_stagionali WHERE id_tariffa=$1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Tariffa non trovata" },
        { status: 404 },
      );
    }
    return NextResponse.json({ messaggio: "Tariffa eliminata" });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore eliminazione tariffa", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
