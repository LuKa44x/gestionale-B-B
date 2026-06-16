import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-non-usare-in-produzione",
);

const rutePubliche = ["/login", "/api/auth"];
const ruteManagerOnly = [
  "/personale",
  "/report",
  "/sconti",
  "/tariffe-stagionali",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotte pubbliche — nessun controllo
  if (rutePubliche.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const ruolo = payload.ruolo as string;

    // Housekeeping: solo camere
    if (ruolo === "Housekeeping") {
      if (
        !pathname.startsWith("/camere") &&
        !pathname.startsWith("/api/camere")
      ) {
        return NextResponse.redirect(new URL("/camere", request.url));
      }
    }

    // Reception: no accesso a pagine di gestione avanzata
    if (ruolo === "Reception") {
      if (ruteManagerOnly.some((r) => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
