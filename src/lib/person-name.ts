/**
 * Validação de nome de pessoa. Não prova que o nome é real (nada no cadastro prova isso),
 * mas barra o que é claramente inventado: um nome só, números, nomes de teste, repetição e teclado.
 */

const MESSAGE =
  "Informe seu nome e sobrenome reais, só com letras. Nomes de teste ou inventados não são aceitos.";

/** Palavras que denunciam nome de teste ou personagem genérico (sem acento, minúsculas). */
const FAKE_WORDS = new Set([
  "teste", "testando", "test", "testing", "tester", "admin", "administrador", "adm", "root",
  "user", "usuario", "username", "nome", "sobrenome", "fulano", "ciclano", "beltrano", "tal",
  "anonimo", "anonymous", "anon", "fake", "falso", "ficticio", "ficticia", "aluno", "aluna",
  "hacker", "player", "jogador", "lab", "null", "undefined", "exemplo", "example", "sample",
  "qwerty", "asdf", "asdfg", "zxcv", "abc", "abcd", "xxx", "aaa", "bbb", "nick", "nickname",
  "guest", "visitante", "cliente", "pessoa", "random", "aleatorio", "naruto", "batman", "goku",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "qazwsx"];

function plain(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function hasKeyboardRun(word: string) {
  return KEYBOARD_ROWS.some((row) => {
    for (let i = 0; i + 4 <= row.length; i += 1) {
      const run = row.slice(i, i + 4);
      if (word.includes(run) || word.includes([...run].reverse().join(""))) return true;
    }
    return false;
  });
}

export type PersonNameResult = { ok: true; name: string } | { ok: false; message: string };

export function validatePersonName(raw: string): PersonNameResult {
  const name = raw.trim().replace(/\s+/g, " ");
  const fail = { ok: false as const, message: MESSAGE };
  if (name.length < 5 || name.length > 60) return fail;
  // Só letras (com acento), apóstrofo, hífen e ponto de abreviação. Pelo menos duas palavras.
  if (!/^\p{L}[\p{L}'’.-]*(?: \p{L}[\p{L}'’.-]*)+$/u.test(name)) return fail;
  const words = plain(name).replace(/[^a-z ]/g, "").split(" ").filter(Boolean);
  // Precisa de nome e sobrenome com pelo menos 2 letras cada (partículas como "da" não contam).
  const real = words.filter((word) => word.length >= 2);
  if (real.length < 2) return fail;
  if (/(\p{L})\1{2,}/iu.test(name)) return fail;
  for (const word of words) {
    if (FAKE_WORDS.has(word)) return fail;
    if (word.length >= 3 && !/[aeiouy]/.test(word)) return fail;
    if (hasKeyboardRun(word)) return fail;
  }
  // "Maria Maria", "Ana Ana": nome e sobrenome iguais.
  if (new Set(real).size === 1) return fail;
  return { ok: true, name };
}

export const PERSON_NAME_MESSAGE = MESSAGE;
