import { expect } from "@playwright/test";
import { answerQuiz, test } from "./helpers";

test("trilha de exposição de dados e headers até o selo", async ({ page, account }) => {
  expect(account.email).toContain("@shieldpath.test");

  await page.goto("/trilha/headers");
  await expect(page.getByRole("heading", { level: 1, name: "Exposição de dados e headers" })).toBeVisible();
  await page.getByRole("link", { name: "Continuar — A resposta fala demais" }).click();

  await answerQuiz(page, [
    "A resposta carrega campos ou detalhes que o cliente não precisa ver",
    /Não\. Qualquer pessoa vê o JSON/,
    /Mostra caminho de arquivo/,
  ]);
  await page.getByRole("link", { name: "Seguir — Headers que protegem" }).click();

  await answerQuiz(page, [
    "O navegador só executa script que traz o nonce desta resposta",
    /Faz o navegador usar só HTTPS/,
    /Outro site carregar a sua página num iframe/,
    /O navegador adivinhar o tipo do arquivo/,
  ]);
  await page.getByRole("link", { name: "Seguir — Sintomas na resposta" }).click();

  await answerQuiz(
    page,
    ["password_hash", /Remover: ele anuncia framework/, /Qualquer script inline roda/],
    { "Em uma frase: por que a regra de campos fica no servidor e não na tela?": "Tudo o que sai na resposta chega inteiro ao cliente." },
  );
  await page.getByRole("link", { name: "Seguir — Fechar a resposta" }).click();

  // Lab: headers sem tirar os campos do JSON não passam; 'unsafe-inline' também não.
  await expect(page.getByText("Alice logada · GET /api/perfil")).toBeVisible();
  await expect(page.getByText(/"password_hash"/)).toBeVisible();
  await page.getByRole("radio", { name: "script-src 'self' 'unsafe-inline'" }).check();
  await page.getByRole("checkbox", { name: /Strict-Transport-Security/ }).check();
  await page.getByRole("checkbox", { name: /nosniff/ }).check();
  await page.getByRole("radio", { name: "frame-ancestors 'self'" }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Escolha no servidor os campos que saem" })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Use nonce por resposta" })).toBeVisible();

  await page.getByRole("checkbox", { name: /Lista permitida de campos/ }).check();
  await page.getByRole("checkbox", { name: /Erro genérico/ }).check();
  await page.getByRole("checkbox", { name: /Remover X-Powered-By/ }).check();
  await page.getByRole("radio", { name: /nonce/ }).check();
  await page.getByRole("checkbox", { name: /Strict-Transport-Security/ }).check();
  await page.getByRole("checkbox", { name: /nosniff/ }).check();
  await page.getByRole("radio", { name: "frame-ancestors 'self'" }).check();
  await expect(page.getByText(/"password_hash"/)).toHaveCount(0);
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByText("O JSON só traz os campos que a tela usa.")).toBeVisible();

  const rail = page.getByRole("navigation", { name: "Unidades da trilha" }).first();
  await rail.getByRole("link", { name: /Checkpoint\s*agora/ }).click();
  await answerQuiz(page, [/Lista de campos no servidor/, /No servidor: next\.config/, "Depois do lab e deste checkpoint"]);
  await expect(page).toHaveURL(/\/trilha\/headers\/selo/);
  await expect(page.getByText(/Emitido em/)).toBeVisible();

  await page.goto("/inicio");
  await expect(page.getByRole("link", { name: /Selo · Exposição de dados e headers/ })).toBeVisible();
});
