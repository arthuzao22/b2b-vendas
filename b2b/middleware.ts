import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { TipoUsuario } from "@prisma/client";
import { getRedirectByUserType } from "./lib/auth";

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/fornecedores",
  "/catalogo-publico",
  "/fornecedor",
];

// Mapeamento de rotas por tipo de usuário
const routesByRole: Record<TipoUsuario, string[]> = {
  [TipoUsuario.admin]: ["/dashboard/admin"],
  [TipoUsuario.fornecedor]: ["/dashboard/fornecedor"],
  [TipoUsuario.cliente]: ["/dashboard/cliente", "/carrinho", "/checkout", "/pedidos", "/rastreamento"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso a arquivos estáticos e API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Se não está autenticado e tenta acessar rota protegida
  if (!token && !isPublicRoute) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Se está autenticado e tenta acessar página de login
  if (token && pathname.startsWith("/auth/login")) {
    const redirectPath = getRedirectByUserType(token.tipo as TipoUsuario);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Verificar permissões de acesso baseadas no tipo de usuário
  if (token && !isPublicRoute) {
    const userType = token.tipo as TipoUsuario;
    const allowedRoutes = routesByRole[userType] || [];

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess && pathname.startsWith("/dashboard")) {
      const correctPath = getRedirectByUserType(userType);
      return NextResponse.redirect(new URL(correctPath, request.url));
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
