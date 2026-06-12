import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Endpoint per ottenere il report di occupazione con KPI e breakdown per canale
export async function GET(request: Request) {
  try {
    // Estrae i parametri di filtro dalla query string
    const { searchParams } = new URL(request.url);
    // Imposta valori di default per il periodo (anno in corso)
    const da =
      searchParams.get("da") ||
      new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    // Imposta il valore di default per "a" alla data odierna
    const a = searchParams.get("a") || new Date().toISOString().split("T")[0];

    // Numero di giorni nel periodo
    const giorni =
      Math.ceil(
        (new Date(a).getTime() - new Date(da).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    // Esegue le query per ottenere i dati necessari per il report
    const [statsResult, canaliResult, totaleCamereResult] = await Promise.all([
      // Statistiche generali
      pool.query(
        `
        SELECT
          COUNT(DISTINCT p.id_prenotazione) AS num_prenotazioni,
          COALESCE(SUM(p.data_checkout - p.data_checkin), 0) AS notti_vendute,
          COALESCE(ROUND(SUM(
            (p.data_checkout - p.data_checkin) * c.prezzo_base_notte
          ), 2), 0) AS ricavi_camere,
          COALESCE(ROUND(SUM(dp_sum.totale_servizi), 2), 0) AS ricavi_servizi
        FROM prenotazioni p
        JOIN camere c ON p.id_camera = c.id_camera
        LEFT JOIN (
          SELECT id_prenotazione, SUM(prezzo_finale) AS totale_servizi
          FROM dettagli_prenotazione
          GROUP BY id_prenotazione
        ) dp_sum ON p.id_prenotazione = dp_sum.id_prenotazione
        WHERE p.data_checkin >= $1 AND p.data_checkin <= $2
        AND p.stato NOT IN ('Annullata', 'No-show')
      `,
        [da, a],
      ),

      // Breakdown per canale
      pool.query(
        `
        SELECT
          p.canale,
          COUNT(*) AS num_prenotazioni,
          COALESCE(SUM(p.data_checkout - p.data_checkin), 0) AS notti,
          COALESCE(ROUND(SUM(
            (p.data_checkout - p.data_checkin) * c.prezzo_base_notte
          ), 2), 0) AS ricavi
        FROM prenotazioni p
        JOIN camere c ON p.id_camera = c.id_camera
        WHERE p.data_checkin >= $1 AND p.data_checkin <= $2
        AND p.stato NOT IN ('Annullata', 'No-show')
        GROUP BY p.canale
        ORDER BY ricavi DESC
      `,
        [da, a],
      ),

      // Totale camere disponibili
      pool.query("SELECT COUNT(*) AS totale FROM camere"),
    ]);

    const stats = statsResult.rows[0];
    const totaleCamere = parseInt(totaleCamereResult.rows[0].totale);
    const nottiVendute = parseInt(stats.notti_vendute);
    const ricaviCamere = parseFloat(stats.ricavi_camere);
    const nottiDisponibili = totaleCamere * giorni;

    const tassoOccupazione =
      nottiDisponibili > 0
        ? Math.round((nottiVendute / nottiDisponibili) * 100)
        : 0;
    const adr =
      nottiVendute > 0
        ? Math.round((ricaviCamere / nottiVendute) * 100) / 100
        : 0;
    const revpar =
      nottiDisponibili > 0
        ? Math.round((ricaviCamere / nottiDisponibili) * 100) / 100
        : 0;

    return NextResponse.json({
      periodo: { da, a, giorni },
      kpi: {
        tasso_occupazione: tassoOccupazione,
        adr,
        revpar,
        num_prenotazioni: parseInt(stats.num_prenotazioni),
        notti_vendute: nottiVendute,
        notti_disponibili: nottiDisponibili,
        ricavi_camere: ricaviCamere,
        ricavi_servizi: parseFloat(stats.ricavi_servizi),
        ricavi_totali: ricaviCamere + parseFloat(stats.ricavi_servizi),
        totale_camere: totaleCamere,
      },
      canali: canaliResult.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore nel report occupazione", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
