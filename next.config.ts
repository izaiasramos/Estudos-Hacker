import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { STATIC_SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "pg"],
  // Não anunciar o framework em `X-Powered-By` (a trilha de headers ensina o mesmo).
  poweredByHeader: false,
  async headers() {
    // A CSP e o HSTS saem do `src/proxy.ts`, porque dependem de cada pedido (nonce e protocolo).
    return [{ source: "/:path*", headers: STATIC_SECURITY_HEADERS }];
  },
};

// O texto das unidades mora em `src/content/<trilha>/<unidade>.mdx` (seção 12.1: conteúdo versionado no Git).
// Nenhum .mdx vira rota: eles só são importados pelo player.
const withMDX = createMDX({});

export default withMDX(nextConfig);
