import { expect, test } from "@playwright/test";
import { answerQuiz, signUpAndAcceptRules } from "./helpers";

test("trilha de controle de acesso até o selo", async ({ page }) => {
  await signUpAndAcceptRules(page, "e2e-idor");

  await page.goto("/trilha/controle-acesso");
  await expect(page.getByRole("heading", { level: 1, name: "Controle de acesso (IDOR)" })).toBeVisible();
  await page.getByRole("link", { name: "Continuar — Quem é vs. o que pode" }).click();

  // Erro primeiro: a explicação aparece e a unidade não fecha.
  await answerQuiz(page, [
    "Quem é a pessoa que está pedindo?",
    "A rota confiou no identificador recebido sem conferir o dono",
    /Não\. Sessão diz quem é/,
  ]);
  await expect(page.getByRole("alert").filter({ hasText: "Ainda não chegou a 70%" })).toBeVisible();
  await expect(page.locator("#quiz")).toHaveClass(/quiz-shake/);

  await answerQuiz(page, [
    "Esta identidade pode ler ou mudar este recurso específico?",
    "A rota confiou no identificador recebido sem conferir o dono",
    /Não\. Sessão diz quem é/,
  ]);
  await expect(page.getByRole("status").filter({ hasText: "100%" })).toBeVisible();
  await expect(page.locator("#quiz")).toHaveClass(/quiz-settle/);
  await page.getByRole("link", { name: "Seguir — Onde o controle some" }).click();

  await answerQuiz(page, [
    /É boa UX, mas a rota precisa conferir o papel/,
    /Não\. Fica mais difícil adivinhar/,
    /Quem mandar `role` ou `userId`/,
  ]);
  await page.getByRole("link", { name: "Seguir — Sintomas no código" }).click();

  await answerQuiz(
    page,
    [/`WHERE id = \?` sem nenhuma condição de dono/, "Da sessão que o servidor emitiu", "404 ou 403, sem o conteúdo do pedido"],
    { "Em uma frase: qual invariante o IDOR quebra?": "O recurso precisa pertencer ao dono da sessão." },
  );
  await page.getByRole("link", { name: "Seguir — Fechar os pedidos" }).click();

  // Lab: só UUID não passa.
  await expect(page.getByText("Alice logada · GET /pedidos/:id")).toBeVisible();
  await page.getByRole("checkbox", { name: "Trocar o id sequencial por UUID" }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Filtre também pelo dono da sessão" })).toBeVisible();

  await page.getByRole("checkbox", { name: /Filtrar pelo dono/ }).check();
  await page.getByRole("checkbox", { name: /Conferir o papel na rota/ }).check();
  await page.getByRole("checkbox", { name: /Negar por padrão/ }).check();
  await page.getByRole("checkbox", { name: /Lista permitida de campos/ }).check();
  await page.getByRole("radio", { name: "404 Não encontrado" }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByText("Consulta filtra pelo dono da sessão.")).toBeVisible();

  // O mapa mostra o lab concluído e o checkpoint como o nó atual.
  const rail = page.getByRole("navigation", { name: "Unidades da trilha" }).first();
  await expect(rail.getByRole("link", { name: /Checkpoint\s*agora/ })).toBeVisible();
  await rail.getByRole("link", { name: /Checkpoint\s*agora/ }).click();

  await answerQuiz(page, [
    /Filtro pelo dono no servidor/,
    /Fechada, liberando de propósito/,
    "Depois do lab e deste checkpoint",
  ]);
  await expect(page).toHaveURL(/\/trilha\/controle-acesso\/selo/);
  await expect(page.getByRole("heading", { name: "Controle de acesso" })).toBeVisible();
  await expect(page.getByText(/Emitido em/)).toBeVisible();

  await page.goto("/inicio");
  await expect(page.getByRole("link", { name: /Selo · Controle de acesso/ })).toBeVisible();
});
