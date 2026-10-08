import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "@mdx-js/mdx";
import { describe, expect, it } from "vitest";
import { TRAILS } from "@/content/trails";

// Quem escreve conteúdo só edita .mdx. Este teste garante, antes do deploy, que cada unidade
// tem o seu arquivo, que ele compila e que só usa os componentes que o player conhece.
const COMPONENTS = new Set(["Callout", "Code", "Glossary"]);
const TONES = new Set(["conceito", "analogia", "armadilha", "dev"]);

const units = TRAILS.flatMap((trail) =>
  trail.units.map((unit) => ({
    slug: trail.slug,
    id: unit.id,
    file: join(process.cwd(), "src/content", trail.slug, `${unit.id}.mdx`),
  })),
);

describe("conteúdo em MDX", () => {
  it.each(units)("$slug/$id tem arquivo, compila e usa só componentes conhecidos", async ({ file }) => {
    expect(existsSync(file), file).toBe(true);
    const source = readFileSync(file, "utf8");
    expect(source.trim().length).toBeGreaterThan(0);
    await expect(compile(source)).resolves.toBeTruthy();

    for (const [, name] of source.matchAll(/<([A-Z][A-Za-z]*)/g)) {
      expect(COMPONENTS.has(name), `componente desconhecido <${name}>`).toBe(true);
    }
    for (const [, tone] of source.matchAll(/<Callout tone="([^"]*)"/g)) {
      expect(TONES.has(tone), `tom desconhecido "${tone}"`).toBe(true);
    }
  });
});
