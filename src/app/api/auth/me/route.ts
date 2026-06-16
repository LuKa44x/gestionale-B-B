import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ errore: "Non autenticato" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ errore: "Token non valido" }, { status: 401 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { errore: "Errore verifica", dettaglio: String(error) },
      { status: 500 },
    );
  }
}
