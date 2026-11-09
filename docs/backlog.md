# Backlog do DefendaDev

**Atualizado em:** 2026-10-26  
**Estado do produto:** beta público. As trilhas e fluxos principais estão disponíveis, mas ainda existem lacunas para considerar a operação pronta para produção plena.

## Estados

- `proposto`: problema registrado, escopo ainda pode mudar.
- `pronto`: escopo e critérios definidos.
- `em andamento`: implementação iniciada.
- `entregue`: implementado e validado no CI.
- `produção`: publicado e validado no ambiente público.

## P0 — segurança e integridade operacional

### OPS-01 — Reclassificar e isolar laboratórios

**Estado:** pronto  
**Problema:** o runtime `embedded`, usado por padrão e na Vercel, é uma simulação dentro do monólito. Ele não oferece isolamento de processo ou rede. Docker isolado existe apenas com `LAB_RUNTIME=local`.

**Critérios de aceite:**

- a UI e a documentação não chamam o modo embedded de isolado;
- simulação e laboratório executável têm classificações explícitas;
- antes de habilitar execução de código do aluno em produção, existe worker separado, egress bloqueado, recursos limitados, TTL e destruição verificável;
- checker e patch não executam código não confiável no processo web.

### DATA-01 — Migrações versionadas

**Estado:** pronto  
**Problema:** `src/lib/db.ts` aplica DDL na primeira requisição e tolera falha parcial da migração complementar.

**Critérios de aceite:** migrations numeradas, tabela de versão, comando pré-deploy, falha de readiness em schema incompatível, backup antes de mudanças destrutivas e procedimento de rollback/restauração testado.

### AUTH-01 — Sessões revogáveis

**Estado:** proposto  
**Problema:** o cookie HMAC é válido por sete dias e não pode ser revogado no servidor.

**Critérios de aceite:** sessão persistida ou versionada, rotação, logout de todos os dispositivos, revogação após troca/reset de senha e teste de sessão roubada/revogada.

### SEC-01 — Origem canônica e CSRF administrativo

**Estado:** proposto  
**Problema:** `sameOrigin` compara o host derivado da requisição. Ações administrativas precisam de defesa adicional.

**Critérios de aceite:** `APP_URL` confiável, comparação de protocolo/host/porta, validação de `Sec-Fetch-Site`, token CSRF para ações sensíveis e testes negativos.

### LAB-01 — Limpeza periódica de labs

**Estado:** pronto  
**Problema:** labs expirados são varridos apenas quando outra operação consulta o runtime.

**Critérios de aceite:** cron/worker idempotente, lock contra concorrência, retries, reconciliação entre banco e runtime e métrica de órfãos.

## P1 — identidade, entrega e qualidade

### AUTH-02 — Recuperação de senha

**Estado:** proposto  
**Critérios de aceite:** token aleatório armazenado em hash, uso único, TTL, resposta sem enumeração de conta, rate limit, revogação das sessões e SMTP transacional.

### AUTH-03 — Verificação de e-mail

**Estado:** proposto  
**Critérios de aceite:** estado verificado, reenvio limitado, token com TTL, tratamento de alteração de e-mail e regra explícita para contas Google.

### AUTH-04 — Vínculo Google e conta local

**Estado:** proposto  
**Critérios de aceite:** vínculo explícito após prova de posse das duas identidades, sem fusão silenciosa, com opção segura de desvincular.

### OPS-02 — Processo de release

**Estado:** pronto  
**Critérios de aceite:** PR e CI, preview/staging, migração, deploy, smoke pós-deploy, promoção, rollback e responsável definido.

### OPS-03 — Observabilidade

**Estado:** proposto  
**Critérios de aceite:** logs estruturados com correlação e redaction, métricas de auth/lab/checker/DB, error tracking, alertas e política de retenção.

### QA-01 — Testes de produção e segurança

**Estado:** proposto  
**Critérios de aceite:** smoke read-only ou contas sintéticas, OAuth mockado, concorrência de XP/selo, migração de versões antigas, expiração de labs, autorização de APIs e headers no domínio publicado.

### A11Y-01 — Auditoria de acessibilidade e áudio

**Estado:** proposto  
**Critérios de aceite:** Playwright + axe nas páginas principais, teclado, foco, zoom/reflow, contraste, link para pular conteúdo e preferência de som separada de redução de movimento. Todo feedback sonoro tem alternativa visual.

### UX-01 — Teste de aceitação com usuário externo

**Estado:** pronto  
**Critérios de aceite:** uma pessoa que não escreveu o conteúdo conclui cadastro, ética, SQL Injection, lab e selo sem ajuda externa; problemas e tempo por tarefa são registrados.

### DOC-01 — Documentação como critério de pronto

**Estado:** em andamento  
**Critérios de aceite:** toda mudança atualiza, na mesma PR, a SPEC de produto, o README operacional e `docs/stacks.md` quando afetados. Afirmações de produção incluem evidência.

## Administração e QA de conteúdo

### ADMIN-01 — Gestão de usuários

**Estado:** entregue (escopo inicial)  
**Entregue:** busca/listagem, detalhe com progresso e tentativas, alteração segura de papel, proteção contra autoalteração/remoção do último admin e encerramento de lab. Hash de senha, token OAuth e respostas livres não são exibidos.

**Próxima etapa:** suspensão/reativação com auditoria persistente, bloqueio imediato em login e sessões existentes, proteção do último admin e motivo obrigatório.

### ADMIN-02 — Central de QA

**Estado:** entregue (preview editorial e Pizzaria embedded)  
**Entregue:** catálogo de todas as trilhas/unidades, inclusive rascunhos e bloqueadas; preview de MDX, cena, prova e gabarito; inicialização direta da Pizzaria embedded pelo admin sem gravar progresso acadêmico.

**Regra:** QA usa rotas `/admin/qa/**` separadas. O modo `practice` não serve para QA porque ainda grava tentativas.

## P2 — evolução opcional

- vídeos curtos opcionais, com legenda, resumo e fallback;
- métricas pedagógicas de ativação, abandono e conversão até o lab;
- dashboard de mentor mais completo;
- novas trilhas defensivas;
- nome final do produto.
