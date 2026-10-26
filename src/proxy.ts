import { NextResponse, type NextRequest } from "next/server";
import { HSTS_HEADER, contentSecurityPolicy, createNonce, isHttps } from "@/lib/security-headers";

/**
 * CSP com nonce por resposta (guia "Content Security Policy" do Next 16). O Next lê o nonce do
 * header `Content-Security-Policy` do pedido e aplica nos scripts e estilos que ele mesmo gera.
 * Os headers fixos (nosniff, Referrer-Policy etc.) saem do `next.config.ts`, para valer também em API e estático.
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const https = isHttps(request.nextUrl, request.headers.get("x-forwarded-proto"));
  const csp = contentSecurityPolicy({
    nonce,
    dev: process.env.NODE_ENV === "development",
    https,
    localLab: process.env.LAB_RUNTIME === "local",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (https) response.headers.set(HSTS_HEADER.key, HSTS_HEADER.value);
  return response;
}

export const config = {
  matcher: [
    {
      // Páginas. API devolve JSON ou redirect; estático não executa script.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
