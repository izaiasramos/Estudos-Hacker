import { expect, test as base } from "@playwright/test";
import { test } from "./helpers";

base.describe("smoke", () => {
  base("landing pública", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Feche o buraco que você acabou de entender." })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Criar conta" })).toBeVisible();
  });

  // Cadastro e regras saem do fixture `account` (helpers.ts), que também apaga a conta no fim.
  test("cadastro, regras e trilha SQL", async ({ page, account }) => {
    expect(account.email).toContain("@shieldpath.test");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Continuar|As trilhas abertas/);
    await page.goto("/trilha/sql-injection");
    await expect(page.getByRole("heading", { name: "SQL Injection" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Continuar —/ })).toBeVisible();
  });
});
