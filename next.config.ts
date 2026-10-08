import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs", "pg"],
};

// O texto das unidades mora em `src/content/<trilha>/<unidade>.mdx` (seção 12.1: conteúdo versionado no Git).
// Nenhum .mdx vira rota: eles só são importados pelo player.
const withMDX = createMDX({});

export default withMDX(nextConfig);
