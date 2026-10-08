import { expect, test } from "@playwright/test";
import { PASSWORD, signUpAndAcceptRules } from "./helpers";

test("perfil: nome, reduzir movimento e exclusão da conta", async ({ page }) => {
  const email = await signUpAndAcceptRules(page, "e2e-perfil");

  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Selos · 0 de 7" })).toBeVisible();

  await page.getByLabel("Nome", { exact: true }).fill("Ana Teste");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Nome atualizado." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Ana Teste" })).toBeVisible();

  // Reduzir movimento liga o atributo no <html> em todas as páginas.
  await expect(page.locator("html")).not.toHaveAttribute("data-motion", "reduce");
  await page.getByRole("checkbox", { name: "Reduzir movimento" }).check();
  await page.getByRole("button", { name: "Salvar preferência" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Preferência de movimento salva." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await page.goto("/trilha/sql-injection");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");

  // Exclusão: e-mail errado não apaga; o certo, com a senha, apaga e encerra a sessão.
  await page.goto("/perfil");
  await page.getByLabel(/para confirmar/).fill("outra@shieldpath.test");
  await page.getByLabel("Senha atual").fill(PASSWORD);
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Nada foi apagado" })).toBeVisible();

  await page.getByLabel(/para confirmar/).fill(email);
  await page.getByLabel("Senha atual").fill(PASSWORD);
  await page.getByRole("button", { name: "Excluir minha conta" }).click();
  await expect(page).toHaveURL(/\/\?conta=excluida/);
  await expect(page.getByRole("status").filter({ hasText: "Conta excluída" })).toBeVisible();

  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/entrar/);
});
