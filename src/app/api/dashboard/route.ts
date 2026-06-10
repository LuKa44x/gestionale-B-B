import { NextResponse } from "next/server";
import pool from "@/lib/db";

// api/dashboard/route.ts
// Endpoint per la dashboard principale
export async function GET() {
  try {
    // Esegue tutte le query in parallelo per migliorare le prestazioni
    const [
      checkinOggi,
      checkoutOggi,
      kpiCamere,
      camereDaPulire,
      prenotazioniRecenti,
    ] = await Promise.all([
      // Check-in di oggi
      pool.query(`
        SELECT p.id_prenotazione, p.data_checkin, p.data_checkout,
               p.numero_ospiti, p.stato,
               o.nome AS ospite_nome, o.cognome AS ospite_cognome,
               c.nome_numero AS camera_nome
        FROM prenotazioni p
        JOIN ospiti o ON p.id_ospite = o.id_ospite
        JOIN camere c ON p.id_camera = c.id_camera
        WHERE p.data_checkin = CURRENT_DATE
        AND p.stato = 'Confermata'
        ORDER BY p.id_prenotazione
      `),

      // Check-out di oggi
      pool.query(`
        SELECT p.id_prenotazione, p.data_checkin, p.data_checkout,
               p.numero_ospiti, p.stato,
               o.nome AS ospite_nome, o.cognome AS ospite_cognome,
               c.nome_numero AS camera_nome
        FROM prenotazioni p
        JOIN ospiti o ON p.id_ospite = o.id_ospite
        JOIN camere c ON p.id_camera = c.id_camera
        WHERE p.data_checkout = CURRENT_DATE
        AND p.stato = 'Check-in effettuato'
        ORDER BY p.id_prenotazione
      `),

      // KPI camere
      pool.query(`
        SELECT
          COUNT(*) AS totale_camere,
          COUNT(*) FILTER (WHERE id_camera IN (
            SELECT id_camera FROM prenotazioni
            WHERE data_checkin <= CURRENT_DATE
            AND data_checkout > CURRENT_DATE
            AND stato NOT IN ('Annullata','No-show')
          )) AS camere_occupate,
          COUNT(*) FILTER (WHERE stato = 'Da pulire') AS camere_da_pulire,
          COUNT(*) FILTER (WHERE stato = 'In manutenzione') AS camere_manutenzione
        FROM camere
      `),

      // Camere da pulire
      pool.query(`
        SELECT * FROM camere
        WHERE stato = 'Da pulire'
        ORDER BY nome_numero
      `),

      // Prenotazioni ultimi 7 giorni
      pool.query(`
        SELECT COUNT(*) AS totale
        FROM prenotazioni
        WHERE data_checkin >= CURRENT_DATE - INTERVAL '7 days'
        AND stato NOT IN ('Annullata')
      `),
    ]);
    // Estrae i KPI principali
    const kpi = kpiCamere.rows[0];
    //  da string a numero per totale e occupate
    const totale = parseInt(kpi.totale_camere);
    const occupate = parseInt(kpi.camere_occupate);

    // Restituisce i dati in formato JSON
    return NextResponse.json({
      checkinOggi: checkinOggi.rows,
      checkoutOggi: checkoutOggi.rows,
      camereDaPulire: camereDaPulire.rows,
      kpi: {
        totale_camere: totale,
        camere_occupate: occupate,
        camere_disponibili: totale - occupate,
        camere_da_pulire: parseInt(kpi.camere_da_pulire),
        camere_manutenzione: parseInt(kpi.camere_manutenzione),
        tasso_occupazione:
          totale > 0 ? Math.round((occupate / totale) * 100) : 0,
        checkin_oggi: checkinOggi.rows.length,
        checkout_oggi: checkoutOggi.rows.length,
        prenotazioni_7_giorni: parseInt(prenotazioniRecenti.rows[0].totale),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        errore: "Errore nel caricamento della dashboard",
        dettaglio: String(error),
      },
      { status: 500 },
    );
  }
}
