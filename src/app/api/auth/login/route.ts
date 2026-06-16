import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { errore: "Email e password obbligatori" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "SELECT * FROM personale WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { errore: "Credenziali non valide" },
        { status: 401 },
      );
    }

    const dipendente = result.rows[0];

    if (!dipendente.password_hash) {
      return NextResponse.json(
        { errore: "Account non configurato. Contatta il manager." },
        { status: 401 },
      );
    }

    const passwordValida = await bcrypt.compare(
      password,
      dipendente.password_hash,
    );
    if (!passwordValida) {
      return NextResponse.json(
        { errore: "Credenziali non valide" },
        { status: 401 },
      );
    }

    const token = await signJWT({
      id_dipendente: dipendente.id_dipendente,
      nome: dipendente.nome,
      cognome: dipendente.cognome,
      ruolo: dipendente.ruolo,
    });

    const response = NextResponse.json({
      messaggio: "Login effettuato",
      utente: {
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        ruolo: dipendente.ruolo,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore durante il login", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
