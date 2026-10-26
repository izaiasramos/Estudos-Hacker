/**
 * Texto curto com trechos entre crases (`assim`) para títulos, perguntas e alternativas do quiz.
 * Não interpreta HTML: o texto é dividido em pedaços e o React escapa cada um.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code key={index} className="rounded bg-white/5 px-1 font-mono text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
