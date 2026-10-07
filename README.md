# ShieldPath

Trilha gamificada de segurança para devs júnior. A spec do produto está em `SPEC.md`.

## O que precisa na máquina

- Node.js 20 ou mais novo
- npm
- Docker, com o Docker Compose

O Docker sobe o Postgres. O laboratório da pizzaria também usa Docker quando a imagem existe; se não existir, o app cai para um processo Node local.

## Primeira vez

```bash
git clone git@github.com:izaiasramos/Estudos-Hacker.git
cd Estudos-Hacker
cp .env.example .env
npm install
docker compose up -d
npm run dev
```

O terminal mostra a URL. Em geral é `http://localhost:3000`. Se essa porta estiver ocupada, o Next escolhe outra e escreve o número na saída.

Abra essa URL, crie uma conta com e-mail e senha e aceite as regras. As tabelas nascem sozinhas na primeira requisição que usa o banco. Quem clona não precisa de `npm run db:import`. Esse comando só copia um SQLite antigo (`data/shieldpath.db`) quando esse arquivo existe e o Postgres ainda está vazio.

## Variáveis

O modelo está em `.env.example`. O arquivo `.env` fica só na sua máquina e não entra no Git.

| Variável | Local |
| --- | --- |
| `DATABASE_URL` | Já vem preenchida para o Postgres do Compose (`localhost:5432`, usuário, senha e banco `shieldpath`). |
| `AUTH_SECRET` | Pode ficar vazio. Em desenvolvimento a sessão usa um segredo fixo do código. Em produção é obrigatório. |
| `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` | Opcionais. Sem eles, o botão do Google avisa que falta configuração. Entrar com e-mail e senha continua funcionando. |

Cada pessoa que quiser o Google cria o próprio cliente OAuth e cola o ID e o segredo só no `.env`. O URI de redirecionamento autorizado é a URL que o `npm run dev` imprimiu, mais `/api/auth/google/callback`. Exemplo: `http://localhost:3000/api/auth/google/callback`.

## Contribuir

O repositório público deixa qualquer pessoa clonar e ler. Enviar código para este repositório pede um destes caminhos:

- a pessoa dona do repo te convida em **Settings → Collaborators**, pelo usuário do GitHub;
- ou você faz um fork, abre a branch lá e manda um pull request.

O e-mail do Git não é cadastrado no repositório. Ele fica na configuração local de cada um (`git config user.email`) e precisa ser um e-mail verificado na conta GitHub dessa pessoa, para o commit aparecer com o nome certo.

Fluxo de uma alteração:

```bash
git checkout main
git pull
git checkout -b descricao-curta
```

Faça a mudança, rode `npm run lint` e abra o pull request para `main`. Não faça commit de `.env`, `data/` nem segredo. A spec do que o produto faz está em `SPEC.md`. O conteúdo das trilhas está em `src/content`.

## Mapa rápido

| Pasta | O que tem |
| --- | --- |
| `src/app` | Páginas e rotas de API |
| `src/components` | Interface |
| `src/content` | Texto e questões das trilhas |
| `src/lib` | Sessão, banco, progresso, time e laboratório |
| `labs/pizzaria` | App fictício do laboratório |
| `SPEC.md` | Spec do produto |
