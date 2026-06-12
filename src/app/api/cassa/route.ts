import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/cassa
// tutte le transazioni con filtri
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const metodo = searchParams.get("metodo");
    const da = searchParams.get("da");
    const a = searchParams.get("a");

    let query = `
      SELECT
        ca.*,
        p.data_checkin, p.data_checkout, p.stato AS stato_prenotazione,
        o.nome AS ospite_nome, o.cognome AS ospite_cognome,
        c.nome_numero AS camera_nome
      FROM cassa ca
      JOIN prenotazioni p ON ca.id_prenotazione = p.id_prenotazione
      JOIN ospiti o ON p.id_ospite = o.id_ospite
      JOIN camere c ON p.id_camera = c.id_camera
      WHERE 1=1
    `;

    const params: string[] = [];
    let i = 1;

    // query dinamica
    if (tipo) {
      query += ` AND ca.tipo = $${i++}`;
      params.push(tipo);
    }
    if (metodo) {
      query += ` AND ca.metodo_pagamento = $${i++}`;
      params.push(metodo);
    }
    if (da) {
      query += ` AND ca.data_ora_pagamento >= $${i++}`;
      params.push(da);
    }
    if (a) {
      query += ` AND ca.data_ora_pagamento <= $${i++}`;
      params.push(a + " 23:59:59");
    }

    query += " ORDER BY ca.data_ora_pagamento DESC";

    const result = await pool.query(query, params);

    // Totale incassato nel filtro corrente
    const totaleIncasso = result.rows
      .filter((r) => r.tipo !== "Rimborso")
      .reduce((sum, r) => sum + parseFloat(r.importo), 0);

    const totaleRimborsi = result.rows
      .filter((r) => r.tipo === "Rimborso")
      .reduce((sum, r) => sum + parseFloat(r.importo), 0);

    return NextResponse.json({
      transazioni: result.rows,
      riepilogo: {
        totale_incasso: Math.round(totaleIncasso * 100) / 100,
        totale_rimborsi: Math.round(totaleRimborsi * 100) / 100,
        saldo_netto: Math.round((totaleIncasso - totaleRimborsi) * 100) / 100,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel recupero cassa", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
