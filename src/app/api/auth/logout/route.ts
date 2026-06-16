import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ messaggio: "Logout effettuato" });
  response.cookies.delete("auth-token");
  return response;
}
