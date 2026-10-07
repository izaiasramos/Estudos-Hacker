# ShieldPath

Trilha gamificada de segurança para devs júnior. A spec do produto está em `SPEC.md`.

## Stack

| Peça | Versão neste repo |
| --- | --- |
| Node.js | 20 ou mais novo. O CI usa 22 |
| Next.js | 16, App Router |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Postgres | 16, imagem `postgres:16-alpine` |
| ESLint | 9 |

Next, React, TypeScript, Tailwind e o cliente do Postgres (`pg`) não se instalam na máquina. O `package.json` fixa as versões, e o `npm install` baixa tudo para a pasta `node_modules` deste projeto. Não use `npm install -g next` nem `npm install -g react`.

## O que instalar na máquina

Instale estes quatro programas, uma vez, antes de clonar. Confira com os comandos da última coluna. Se o comando imprimir um número de versão, está pronto.

| Programa | Para que serve | Onde baixar | Conferir |
| --- | --- | --- | --- |
| Git | Clonar o repo e enviar a branch | https://git-scm.com/downloads | `git --version` |
| Node.js 20 ou mais novo, com npm | Rodar o app e instalar as bibliotecas | https://nodejs.org/ — o instalador já traz o npm | `node --version` e `npm --version` |
| Docker Engine e Docker Compose | Subir o Postgres | https://docs.docker.com/get-docker/ | `docker --version` e `docker compose version` |
| Conta no GitHub | Abrir pull request | https://github.com/signup | — |

No Linux, o Docker precisa do serviço ligado. `docker compose version` tem que funcionar. Se o comando responder que não acha o daemon, abra o Docker e espere ele ficar pronto.

O Git pede nome e e-mail uma vez nesta máquina. O e-mail tem de ser um e-mail verificado na sua conta do GitHub, para o commit aparecer com o seu usuário.

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## Primeira vez

Quem já tem chave SSH no GitHub:

```bash
git clone git@github.com:izaiasramos/Estudos-Hacker.git
```

Quem ainda não configurou SSH usa HTTPS:

```bash
git clone https://github.com/izaiasramos/Estudos-Hacker.git
```

Dentro da pasta:

```bash
cd Estudos-Hacker
cp .env.example .env
npm install
docker compose up -d
npm run dev
```

O que cada comando faz:

1. `cp .env.example .env` cria o arquivo local de configuração. O Next lê o `.env`. Ele não lê o `.env.example`.
2. `npm install` baixa Next, React e o resto para `node_modules`, nas versões do `package-lock.json`.
3. `docker compose up -d` sobe o Postgres em segundo plano, na porta `5432`, com usuário, senha e banco `shieldpath`. Os dados ficam no volume Docker `shieldpath-pg`.
4. `npm run dev` sobe o app. O terminal mostra a URL. Em geral é `http://localhost:3000`. Se essa porta estiver ocupada, o Next escolhe outra e escreve o número na saída.

Abra essa URL, crie uma conta com e-mail e senha e aceite as regras. As tabelas nascem sozinhas na primeira requisição que usa o banco.

`npm run db:import` não faz parte da instalação de quem clona. Esse comando só copia um SQLite antigo (`data/shieldpath.db`) quando esse arquivo existe e o Postgres ainda está vazio.

Para parar o banco: `docker compose stop`. Para subir de novo: `docker compose up -d`. Para ver se o container está de pé: `docker compose ps`.

O laboratório da pizzaria (unidade 6 da trilha SQL) abre em `/lab/pizzaria`, no mesmo site. Funciona na Vercel sem Docker extra. Se quiser o container isolado na máquina, coloque `LAB_RUNTIME=local` no `.env`.

## Variáveis

O modelo está em `.env.example`. O arquivo `.env` fica só na sua máquina e não entra no Git.

| Variável | Local |
| --- | --- |
| `DATABASE_URL` | Já vem preenchida para o Postgres do Compose (`localhost:5432`, usuário, senha e banco `shieldpath`). |
| `AUTH_SECRET` | Pode ficar vazio. Em desenvolvimento a sessão usa um segredo fixo do código. Em produção é obrigatório. |
| `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` | Opcionais. Sem eles, o botão do Google avisa que falta configuração. Entrar com e-mail e senha continua funcionando. |

Cada pessoa que quiser o Google cria o próprio cliente OAuth e cola o ID e o segredo só no `.env`. O URI de redirecionamento autorizado é a URL que o `npm run dev` imprimiu, mais `/api/auth/google/callback`. Exemplo: `http://localhost:3000/api/auth/google/callback`.

## Contribuir

O repositório é público: qualquer pessoa clona e lê. Enviar código para este repositório pede um destes caminhos:

- a pessoa dona do repo te convida em **Settings → Collaborators**, pelo usuário do GitHub;
- ou você faz um fork, abre a branch lá e manda um pull request.

O e-mail do Git não é cadastrado no repositório. Ele fica na configuração local de cada um.

O ramo `main` está protegido. O GitHub recusa push direto nele. Toda alteração nasce numa branch nova, a partir do `main` atualizado, e entra por pull request.

```bash
git checkout main
git pull
git checkout -b descricao-curta
```

Faça a mudança. Antes de enviar, rode na sua máquina:

```bash
npm run lint
npx tsc --noEmit
```

Depois envie a branch e abra o pull request para `main`:

```bash
git push -u origin descricao-curta
```

O GitHub mostra o link para abrir o pull request. Na página do pull request, o check `check` começa sozinho. Espere ele ficar verde antes de pedir o merge.

Não faça commit de `.env`, `data/` nem segredo. A spec do que o produto faz está em `SPEC.md`. O conteúdo das trilhas está em `src/content`.

## CI

O workflow está em `.github/workflows/ci.yml`. Ele roda no GitHub em todo pull request e em todo push no `main`. A máquina do GitHub é limpa: ela não usa o seu `.env` nem o seu `node_modules`.

O job se chama `check` e executa, nesta ordem:

1. `npm ci` — instala exatamente o que está no `package-lock.json`
2. `npm run lint`
3. `npx next typegen` — gera tipos do Next que não vão para o Git, como `LayoutProps`
4. `npx tsc --noEmit`
5. `npm run build`

Para ver o log:

1. Abra o pull request.
2. No bloco de checks, clique em **Details** ao lado de `check`. O mesmo log está na aba **Actions** do repositório.
3. O passo vermelho é o que falhou. Abra esse passo e leia a última mensagem. Corrija na mesma branch, faça outro commit e dê `git push`. O check roda de novo sozinho.
4. O merge no `main` só é aceito com o check verde.

O primeiro commit de um pull request pode ficar vermelho no histórico. O que importa é o check do commit mais novo.

## Se algo falhar na instalação

| O que aparece | O que fazer |
| --- | --- |
| `node` ou `npm` não encontrado | Instale o Node.js 20 ou mais novo pelo link da tabela. Feche e abra o terminal. |
| `docker: command not found` ou daemon desligado | Instale o Docker e deixe o serviço rodando. Teste de novo com `docker compose version`. |
| `DATABASE_URL ausente` | Falta o `.env`. Rode `cp .env.example .env` na raiz do repo. |
| Porta `5432` ocupada | Já existe outro Postgres nessa porta. Pare o outro serviço ou mude a porta no `docker-compose.yml` e no `DATABASE_URL`. |
| `Permission denied (publickey)` no clone SSH | Use o clone HTTPS, ou cadastre uma chave SSH na sua conta GitHub. |
| Push no `main` recusado | Crie uma branch a partir do `main` e abra o pull request. |
| Check do CI vermelho | Abra **Details**, leia o passo vermelho, corrija e envie outro commit na mesma branch. |

## Mapa rápido

| Pasta | O que tem |
| --- | --- |
| `src/app` | Páginas e rotas de API |
| `src/components` | Interface |
| `src/content` | Texto e questões das trilhas |
| `src/lib` | Sessão, banco, progresso, time e laboratório |
| `labs/pizzaria` | App fictício do laboratório |
| `.github/workflows/ci.yml` | O check que o pull request dispara |
| `SPEC.md` | Spec do produto |
