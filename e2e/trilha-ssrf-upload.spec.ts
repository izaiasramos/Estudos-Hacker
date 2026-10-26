import { expect } from "@playwright/test";
import { answerQuiz, test } from "./helpers";

test("trilha de SSRF até o selo", async ({ page, account }) => {
  expect(account.email).toContain("@shieldpath.test");

  await page.goto("/trilha/ssrf");
  await page.getByRole("link", { name: "Continuar — O servidor busca por você" }).click();
  await answerQuiz(page, [/O servidor faz um pedido HTTP/, /O servidor está dentro da rede/, /Prévia de link/]);
  await page.getByRole("link", { name: "Seguir — Onde a checagem falha" }).click();
  await answerQuiz(page, [/Não\. Outro nome/, /Não seguir o redirect/, /Em nuvens como AWS/]);
  await page.getByRole("link", { name: "Seguir — Sintomas no código" }).click();
  await answerQuiz(page, [/fetch\(req\.body\.url\) sem checar/, /Outros esquemas/, /Se algo interno passar/], {
    "Em uma frase: por que a checagem tem de olhar o IP resolvido e não o texto da URL?":
      "Um nome inocente pode resolver para um IP interno.",
  });
  await page.getByRole("link", { name: "Seguir — Fechar a prévia de link" }).click();

  // Regra de texto não substitui conferir o IP resolvido.
  await page.getByRole("checkbox", { name: /Lista permitida de esquema/ }).check();
  await page.getByRole("checkbox", { name: /Recusar URLs que contenham localhost/ }).check();
  await page.getByRole("checkbox", { name: /Não seguir redirect/ }).check();
  await page.getByRole("checkbox", { name: /Devolver só o resumo/ }).check();
  await expect(page.getByText("A regra de texto barrou o localhost")).toBeVisible();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Recuse IP interno" })).toBeVisible();

  await page.getByRole("checkbox", { name: /Lista permitida de esquema/ }).check();
  await page.getByRole("checkbox", { name: /Resolver o nome e recusar IP interno/ }).check();
  await page.getByRole("checkbox", { name: /Não seguir redirect/ }).check();
  await page.getByRole("checkbox", { name: /Devolver só o resumo/ }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByText("Só HTTPS entra.")).toBeVisible();

  const rail = page.getByRole("navigation", { name: "Unidades da trilha" }).first();
  await rail.getByRole("link", { name: /Checkpoint\s*agora/ }).click();
  await answerQuiz(page, [/Esquema permitido, IP resolvido/, /Rodar quem busca URLs/, "Depois do lab e deste checkpoint"]);
  await expect(page).toHaveURL(/\/trilha\/ssrf\/selo/);
  await expect(page.getByText(/Emitido em/)).toBeVisible();
});

test("trilha de upload inseguro até o selo", async ({ page, account }) => {
  expect(account.email).toContain("@shieldpath.test");

  await page.goto("/trilha/upload");
  await page.getByRole("link", { name: "Continuar — Arquivo não é só arquivo" }).click();
  await answerQuiz(page, [/O servidor guardar ou servir o arquivo/, /Não\. Esse valor é escrito pelo cliente/, /Ao abrir o link/]);
  await page.getByRole("link", { name: "Seguir — Nome, conteúdo e entrega" }).click();
  await answerQuiz(page, [/Nome do usuário pode trazer/, /Não\. Extensão é texto do cliente/, /De outro domínio/]);
  await page.getByRole("link", { name: "Seguir — Sintomas no código" }).click();
  await answerQuiz(page, [/path\.join\("public\/uploads", file\.name\)/, /Sem limite, um arquivo gigante/, /Recusar SVG ou convertê-lo/], {
    "Em uma frase: por que nome, tipo e tamanho são decididos pelo servidor?":
      "Tudo o que vem no pedido é escolhido pelo cliente.",
  });
  await page.getByRole("link", { name: "Seguir — Fechar o upload de avatar" }).click();

  // Confiar no Content-Type do pedido não conta como conferir o conteúdo.
  await page.getByRole("checkbox", { name: /Aceitar só se o Content-Type/ }).check();
  await page.getByRole("checkbox", { name: /Gerar o nome no servidor/ }).check();
  await page.getByRole("checkbox", { name: /Limite de tamanho/ }).check();
  await page.getByRole("checkbox", { name: /Servir de outro domínio/ }).check();
  await page.getByRole("radio", { name: "Recusar SVG" }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Confira a assinatura do conteúdo" })).toBeVisible();

  await page.getByRole("checkbox", { name: /Conferir a assinatura do conteúdo/ }).check();
  await page.getByRole("checkbox", { name: /Gerar o nome no servidor/ }).check();
  await page.getByRole("checkbox", { name: /Limite de tamanho/ }).check();
  await page.getByRole("checkbox", { name: /Servir de outro domínio/ }).check();
  await page.getByRole("radio", { name: "Converter SVG para PNG no servidor" }).check();
  await page.getByRole("button", { name: "Conferir defesas" }).click();
  await expect(page.getByText("O nome salvo é gerado no servidor.")).toBeVisible();

  const rail = page.getByRole("navigation", { name: "Unidades da trilha" }).first();
  await rail.getByRole("link", { name: /Checkpoint\s*agora/ }).click();
  await answerQuiz(page, [/Conteúdo conferido e reprocessado/, /Não\. Ele pode ajudar a recusar cedo/, "Depois do lab e deste checkpoint"]);
  await expect(page).toHaveURL(/\/trilha\/upload\/selo/);

  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Selos · 1 de 10" })).toBeVisible();
});
