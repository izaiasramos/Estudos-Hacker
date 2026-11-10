import { describe, expect, it } from "vitest";
import { validatePersonName } from "./person-name";

describe("validatePersonName", () => {
  it.each([
    "Izaias Ramos França",
    "Maria da Silva",
    "João Pedro D'Ávila",
    "Ana-Clara Souza",
    "José Luiz dos Santos Jr.",
    "Ng Wei",
    "Ana Souza",
  ])("aceita %s", (name) => {
    expect(validatePersonName(name).ok).toBe(true);
  });

  it.each([
    "Izaias",
    "teste teste",
    "Ana Teste",
    "admin user",
    "Aluno 123",
    "Lab 1791217465",
    "Player 1791",
    "Rank 1794326237550",
    "Sessao 1791218309",
    "asdf qwer",
    "qwerty uiop",
    "kkkkk kkkkk",
    "Fulano de Tal",
    "Maria Maria",
    "João123 Silva",
    "A B",
    "Hacker Pro",
    "bcd fgh",
    "",
    "   ",
  ])("recusa %j", (name) => {
    expect(validatePersonName(name).ok).toBe(false);
  });

  it("normaliza espaços", () => {
    expect(validatePersonName("  Ana   Souza ")).toEqual({ ok: true, name: "Ana Souza" });
  });
});
