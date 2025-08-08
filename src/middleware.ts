import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/* ------------------------------------------------------------------
 * 1‧ Clave secreta para validar la firma del JWT
 *    (debe ser la MISMA que usa tu backend al firmar el token)
 * ------------------------------------------------------------------ */
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);


export const config = {
  matcher: [
    "/pages/dash",          // dashboard raíz
    "/pages/dash/:path*",   // sub-rutas
    "/pages/admin",
    "/pages/admin/:path*",
    "/pages/projects",
    "/pages/projects/:path*",
    "/pages/collaborators",
    "/pages/collaborators/:path*",
    "/pages/vacantes",
    "/pages/vacantes/:path*",
    "/pages/tecnology",
    "/pages/tecnology/:path*",
  ],
};

/* ------------------------------------------------------------------
 * 3‧ Middleware — se ejecuta ANTES de renderizar la página
 * ------------------------------------------------------------------ */
export async function middleware(req: NextRequest) {

  /* 3.1‧ Extrae la cookie 'token' */
  const token = req.cookies.get("token")?.value;
  if (!token) {
    // No hay sesión → redirige al login
    return NextResponse.redirect(new URL("/", req.url));
  }

  /* 3.2‧ Verifica firma + expiración */
  try {
    const { payload } = await jwtVerify(token, secret);

    // 3.3‧ Pasa datos mínimos al resto de la app (opc.)
    const res = NextResponse.next();
    res.headers.set(
      "x-user",
      JSON.stringify({
        id:  payload.id,
        name: payload.name,
        rol: payload.rol,
      }),
    );
    return res;
  } catch {
    // Firma inválida o token vencido → vuelve a /login
    return NextResponse.redirect(new URL("/", req.url));
  }
}
