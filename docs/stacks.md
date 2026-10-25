# Stacks e fluxos

O que cada peça do ShieldPath faz, onde ela roda e o que precisa estar de pé para ela funcionar. O passo a passo de instalação está no `README.md`; aqui fica o porquê e o caminho de cada pedido.

## Visão geral

| Peça | Versão | Onde roda | Papel |
| --- | --- | --- | --- |
| Node.js | 20+ (CI usa 22) | máquina, CI, Vercel | executa o Next, os scripts e os testes |
| Next.js (App Router) | 16.3.8 | `npm run dev` / Vercel | páginas, rotas de API, `proxy.ts` |
| React | 19 | servidor e navegador | interface; Server Components por padrão |
| TypeScript | 5 | build | tipos de todo `src/` |
| Tailwind CSS | 4 | build | estilo; tokens em `src/app/globals.css` |
| motion | 14 | navegador | animação da trilha na landing |
| MDX (`@next/mdx`) | 16.3.8 / mdx-js 3.1.1 | build | texto das unidades em `src/content/<trilha>/*.mdx` |
| PostgreSQL | 16 | Docker local / Supabase | contas, progresso, labs, times, falhas de login |
| `pg` | 8 | servidor | cliente do Postgres (pool em `src/lib/db.ts`) |
| bcryptjs | 3 | servidor | hash das senhas |
| Docker + Compose | Compose v2 | máquina | sobe o Postgres local; lab legado opcional |
| Vitest | 3 | máquina, CI | testes da lógica pura (`*.test.ts`) |
| Playwright | 1.64 | máquina, CI | E2E no navegador (`e2e/`) |
| ESLint | 9 | máquina, CI | lint (`eslint.config.mjs`) |
| GitHub Actions | — | GitHub | CI de todo pull request |
| Vercel | plano free | nuvem | hospeda o app; deploy a cada merge no `main` |
| Supabase | plano free | nuvem | Postgres de produção |

## Ambiente local

### Comando único

```bash
npm run dev
```

O `npm` roda o `predev` antes (`scripts/db-up.mjs`):

1. Lê o `DATABASE_URL` do ambiente ou do `.env`. Sem ele, para e manda criar o `.env`.
2. Se o host for `localhost`, roda `docker compose up -d --wait postgres` e espera o healthcheck (`pg_isready`) ficar verde.
3. Se o host for outro (Supabase) ou se for CI, não sobe nada.
4. Só então o `next dev` começa.

O container tem `restart: unless-stopped`: ele volta sozinho quando o Docker reinicia (boot da máquina). Ele só fica parado depois de `npm run db:stop`.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | sobe o Postgres (se local) e o app |
| `npm run db:up` | só o Postgres, esperando ficar pronto |
| `npm run db:stop` | para o Postgres (os dados ficam no volume `shieldpath-pg`) |
| `npm run db:logs` | log do Postgres ao vivo |
| `npm run test:e2e` | sobe o Postgres, depois roda o Playwright |

### O que precisa estar de pé

| Peça | Depende de | Sinal de que falta |
| --- | --- | --- |
| Next (`npm run dev`) | Node, `node_modules`, `.env` | `next: not found` → `npm install` |
| Login, trilhas, perfil | Postgres respondendo no `DATABASE_URL` | página ou login com erro 500; no terminal, `ECONNREFUSED 127.0.0.1:5432` |
| Postgres local | Docker ligado, porta 5432 livre | `npm run dev` para em `[db]` com a causa |
| Login com Google | `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` | o botão avisa que falta configuração |
| Lab legado | `LAB_RUNTIME=local` e Docker | o lab cai para processo Node em `127.0.0.1` |

## Fluxos

### Banco (Postgres)

1. A primeira consulta abre o pool (`src/lib/db.ts`, até 10 conexões).
2. Antes dela, roda o `SCHEMA_SQL` uma vez por processo: `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE … ADD COLUMN IF NOT EXISTS`. Não há ferramenta de migração; coluna nova entra nesse SQL.
3. As consultas usam `?` e o código troca por `$1, $2…`. Valor nunca entra concatenado na string.

Tabelas: `users`, `progress`, `lab_sessions`, `squads`, `squad_members`, `login_failures` (detalhe na seção 13 da `SPEC.md`).

### Conta e sessão

1. Cadastro (`POST /api/auth/register`): confere origem, valida e-mail e senha (8+ caracteres, fora da lista de senhas comuns), grava hash bcrypt.
2. Login (`POST /api/auth/login`): confere origem e o limite de tentativas (5 por e-mail, 30 por IP em 15 min) **antes** do bcrypt. Erro é sempre genérico.
3. Sessão: cookie `shieldpath_session` httpOnly, `SameSite=Lax`, assinado com HMAC-SHA256 usando `AUTH_SECRET`, validade de 7 dias. Em produção, sem `AUTH_SECRET` o app recusa subir a sessão.
4. Google: `/api/auth/google` → Google → `/api/auth/google/callback`, com `state` em cookie. Conta local com o mesmo e-mail não é fundida sozinha.
5. Toda rota que muda estado confere `Origin`/`Referer` (`sameOrigin` em `src/lib/http.ts`).

### Trilha, quiz e selo

1. O conteúdo está no Git: metadados e quiz em `src/content/<trilha>.ts`, texto em `src/content/<trilha>/<unidade>.mdx`, lista das trilhas em `src/content/trails.ts`.
2. As páginas `/trilha/[trail]`, `/trilha/[trail]/[unit]` e `/trilha/[trail]/selo` leem essa lista. Trilha com `status: "rascunho"` só aparece para admin.
3. Quiz (`POST /api/trilha/quiz`): a nota sai no servidor; 70% passa. Progresso e XP vão para `progress` e `users.xp`.
4. Lab defensivo: rota `POST /api/trilha/<trilha>-lab` (ou `/api/trilha/lab` no SQL) roda o checker e marca o lab.
5. Selo: sai sozinho quando o lab defensivo e o checkpoint da trilha estão concluídos. O XP do selo só é pago se a linha do selo nasceu naquele pedido.

### Laboratório da pizzaria

| Modo | Quando | Como funciona |
| --- | --- | --- |
| Embutido (padrão) | sempre, inclusive na Vercel | `lab_sessions` com `runtime = embedded`; o iframe abre `/lab/pizzaria` no mesmo domínio |
| Docker (`LAB_RUNTIME=local`) | só na máquina | builda a imagem `shieldpath-pizzaria` de `labs/pizzaria`, roda com `--cap-drop=ALL`, `--read-only`, 128 MB, rede `shieldpath-labs` sem saída, porta só em `127.0.0.1` |
| Processo (`LAB_RUNTIME=local` sem Docker) | reserva | `node labs/pizzaria/server.mjs` numa porta livre em `127.0.0.1` |

O lab expira em 75 minutos. Admin vê e derruba os labs no ar em `/admin`.

### Headers de segurança

1. `src/proxy.ts` roda antes de toda página: gera um nonce novo e manda a `Content-Security-Policy` (script só com nonce, `frame-ancestors 'self'`, `object-src 'none'`). O Next aplica o nonce nos scripts dele. Sobre HTTPS, manda também o HSTS.
2. `next.config.ts` manda em toda resposta (páginas, API e estáticos): `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` e `Cross-Origin-Opener-Policy`, e desliga o `X-Powered-By`.
3. As regras ficam em `src/lib/security-headers.ts` e têm teste em `security-headers.test.ts`.

Em `next dev`, a CSP libera `'unsafe-eval'` e estilo inline, que o React usa para mostrar erro do servidor no navegador. Em produção, não.

### Testes

| Tipo | Comando | Precisa de |
| --- | --- | --- |
| Lint | `npm run lint` | nada |
| Tipos | `npx next typegen && npx tsc --noEmit` | nada |
| Unidade (Vitest) | `npm test` | nada (não toca no banco) |
| E2E (Playwright) | `npm run build && npm run test:e2e` | Postgres (o `pretest:e2e` sobe) e o Chromium (`npx playwright install chromium`, uma vez) |

O Playwright sobe o app com `npm run start` na porta **3100**, para não esbarrar num `npm run dev` aberto na 3000. Cada teste cria uma conta nova e a apaga no fim pelo próprio app.

### CI (GitHub Actions)

`.github/workflows/ci.yml`, em todo pull request e push no `main`:

1. Job `check`: `npm ci` → lint → `next typegen` → `tsc` → `npm test` → `npm run build`.
2. Job `e2e`: sobe um Postgres como service do workflow, instala o Chromium, faz build e roda o Playwright. O `db-up.mjs` vê `CI` e não chama Docker.

O `main` só aceita merge com os checks verdes.

### Produção (Vercel + Supabase)

1. Merge no `main` → a Vercel builda e publica.
2. Variáveis na Vercel: `DATABASE_URL` (Supabase), `AUTH_SECRET` (obrigatória), `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` (opcionais). `LAB_RUNTIME` não é definido: o lab roda embutido.
3. O schema nasce sozinho no Supabase na primeira requisição.
4. TLS termina na borda da Vercel; o app lê `x-forwarded-proto` para saber se manda HSTS.

Papel de admin muda só por script, com o `DATABASE_URL` do ambiente certo:

```bash
DATABASE_URL=... node scripts/set-role.mjs pessoa@exemplo.com admin
```
