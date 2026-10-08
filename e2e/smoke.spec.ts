import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing pública", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Feche o buraco que você acabou de entender." })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Criar conta" })).toBeVisible();
  });

  test("cadastro, regras e trilha SQL", async ({ page }) => {
    const email = `e2e-${Date.now()}@shieldpath.test`;
    const password = "SenhaE2eShield1!";

    await page.goto("/criar-conta");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(/\/regras/);
    await expect(page.getByRole("heading", { name: "Regras do jogo" })).toBeVisible();

    await page.getByRole("radio", { name: "Só no laboratório da plataforma" }).check();
    await page.getByRole("radio", { name: "Depois de fechar o buraco na defesa" }).check();
    await page.getByRole("checkbox", { name: /Li as regras/ }).check();
    await page.getByRole("button", { name: "Confirmar e continuar" }).click();

    await expect(page).toHaveURL(/\/inicio/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Continuar|As duas especialidades/);

    await page.goto("/trilha/sql-injection");
    await expect(page.getByRole("heading", { name: "SQL Injection" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Continuar —/ })).toBeVisible();
  });
});
