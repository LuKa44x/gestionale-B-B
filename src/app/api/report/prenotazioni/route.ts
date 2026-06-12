import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Endpoint per ottenere il report delle prenotazioni con filtri e riepilogo
export async function GET(request: Request) {
  try {
    // Estrae i parametri di filtro dalla query string
    const { searchParams } = new URL(request.url);
    const da =
      searchParams.get("da") ||
      new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const a = searchParams.get("a") || new Date().toISOString().split("T")[0];
    const stato = searchParams.get("stato") || "";
    const canale = searchParams.get("canale") || "";

    // Costruisce la query SQL dinamicamente in base ai filtri
    let query = `
      SELECT
        p.id_prenotazione, p.data_checkin, p.data_checkout,
        p.numero_ospiti, p.stato, p.canale,
        o.nome AS ospite_nome, o.cognome AS ospite_cognome,
        c.nome_numero AS camera_nome, c.tipologia AS camera_tipologia,
        c.prezzo_base_notte,
        (p.data_checkout - p.data_checkin) AS notti,
        ROUND((p.data_checkout - p.data_checkin) * c.prezzo_base_notte, 2) AS importo_camera,
        COALESCE(ROUND(SUM(dp.prezzo_finale), 2), 0) AS importo_servizi,
        ROUND(
          (p.data_checkout - p.data_checkin) * c.prezzo_base_notte +
          COALESCE(SUM(dp.prezzo_finale), 0), 2
        ) AS totale
      FROM prenotazioni p
      JOIN ospiti o ON p.id_ospite = o.id_ospite
      JOIN camere c ON p.id_camera = c.id_camera
      LEFT JOIN dettagli_prenotazione dp ON p.id_prenotazione = dp.id_prenotazione
      WHERE p.data_checkin >= $1 AND p.data_checkin <= $2
    `;

    const params: string[] = [da, a];
    let i = 3;
    // Aggiunge condizioni alla query in base ai filtri
    if (stato) {
      query += ` AND p.stato = $${i++}`;
      params.push(stato);
    }
    if (canale) {
      query += ` AND p.canale = $${i++}`;
      params.push(canale);
    }

    query += `
      GROUP BY p.id_prenotazione, o.nome, o.cognome,
               c.nome_numero, c.tipologia, c.prezzo_base_notte
      ORDER BY p.data_checkin DESC
    `;

    const result = await pool.query(query, params);

    // Calcola i totali del periodo
    const totaleImporto = result.rows.reduce(
      (sum, r) => sum + parseFloat(r.totale),
      0,
    );
    const totaleNotti = result.rows.reduce(
      (sum, r) => sum + parseInt(r.notti),
      0,
    );

    return NextResponse.json({
      prenotazioni: result.rows,
      riepilogo: {
        num_prenotazioni: result.rows.length,
        totale_notti: totaleNotti,
        totale_importo: Math.round(totaleImporto * 100) / 100,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel report prenotazioni", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
