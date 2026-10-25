import { test as base, expect, type Page } from "@playwright/test";

export const PASSWORD = "SenhaE2eShield1!";

/** Cria uma conta nova pela UI e passa pelas Regras do jogo. Devolve o e-mail usado. */
export async function signUpAndAcceptRules(page: Page, prefix = "e2e") {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@shieldpath.test`;

  await page.goto("/criar-conta");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL(/\/regras/);
  await expect(page.getByRole("heading", { name: "Regras do jogo" })).toBeVisible();

  await page.getByRole("radio", { name: "Só no laboratório da plataforma" }).check();
  await page.getByRole("radio", { name: "Depois de fechar o buraco na defesa" }).check();
  await page.getByRole("checkbox", { name: /Li as regras/ }).check();
  await page.getByRole("button", { name: "Confirmar e continuar" }).click();
  await expect(page).toHaveURL(/\/inicio/);

  return email;
}

/** Marca as alternativas pelo texto do rótulo (a ordem é embaralhada) e envia o quiz. */
export async function answerQuiz(page: Page, choices: (string | RegExp)[], texts: Record<string, string> = {}) {
  for (const name of choices) {
    await page.getByRole("radio", { name }).check();
  }
  for (const [label, value] of Object.entries(texts)) {
    await page.getByLabel(label).fill(value);
  }
  await page.getByRole("button", { name: "Enviar respostas" }).click();
}

/**
 * Apaga a conta pelo próprio app (POST /api/perfil/excluir), com a sessão da página.
 * Assim o teste não precisa de acesso ao banco e o Postgres local não acumula contas `e2e-…`.
 */
export async function deleteAccount(page: Page, email: string) {
  const origin = new URL(page.url() || "http://localhost:3000").origin;
  const response = await page.request.post("/api/perfil/excluir", {
    form: { email, password: PASSWORD },
    headers: { Origin: origin },
    maxRedirects: 0,
  });
  return response.status() === 303 && (response.headers().location ?? "").includes("conta=excluida");
}

/** `test` com uma conta nova já nas regras aceitas, apagada no fim mesmo se o teste falhar. */
export const test = base.extend<{ account: { email: string } }>({
  account: async ({ page }, provide) => {
    const email = await signUpAndAcceptRules(page);
    const account = { email };
    await provide(account);
    // Se o próprio teste já apagou a conta (perfil), não sobra nada para limpar.
    if (account.email) await deleteAccount(page, account.email);
  },
});
