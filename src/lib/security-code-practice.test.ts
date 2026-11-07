import { describe, expect, it } from "vitest";
import {
  inspectCode,
  SECURITY_CODE_PRACTICES,
  SECURITY_TOPICS,
} from "@/lib/security-code-practice";

describe("oficinas cumulativas de código", () => {
  it.each(SECURITY_TOPICS)("%s tem quatro níveis cumulativos e solução reconhecida", (topic) => {
    const practice = SECURITY_CODE_PRACTICES[topic];
    expect(practice.levels.map((level) => level.id)).toEqual([
      "piece",
      "extend",
      "complete",
      "review",
    ]);
    expect(practice.tests).toHaveLength(4);

    for (const level of practice.levels) {
      expect(level.starter.length).toBeGreaterThan(20);
      expect(level.lines).toHaveLength(level.solution.split("\n").length);
      expect(level.lines.map((line) => line.line)).toEqual(level.lines.map((_, index) => index + 1));
      expect(level.lines.every((line) => line.explanation.length > 15)).toBe(true);
      expect(level.steps.length).toBeGreaterThan(0);
      expect(level.hints).toHaveLength(3);
      const failed = inspectCode(level.solution, level).filter((result) => !result.ok);
      expect(failed, `${topic}/${level.id}: ${failed.map((result) => result.label).join(", ")}`).toEqual([]);
      expect(inspectCode(level.starter, level).some((result) => !result.ok)).toBe(true);
    }
    expect(practice.anatomy.length).toBeGreaterThan(1);
    expect(practice.exampleCall.length).toBeGreaterThan(5);
  });

  it.each(SECURITY_TOPICS)("%s não aprova o código vulnerável na revisão", (topic) => {
    const review = SECURITY_CODE_PRACTICES[topic].levels[3];
    expect(inspectCode(review.starter, review).some((result) => !result.ok)).toBe(true);
  });

  it("ignora palavras colocadas apenas em comentários", () => {
    const level = SECURITY_CODE_PRACTICES.idor.levels[0];
    const source = `// userId: session.userId\nasync function getOrder(session, orderId) {\n  return orders.findById(orderId)\n}`;
    expect(inspectCode(source, level).every((result) => result.ok)).toBe(false);
  });
});
