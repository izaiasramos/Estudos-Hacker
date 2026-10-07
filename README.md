# ShieldPath

Trilha gamificada de segurança para devs júnior. A spec do produto está em `SPEC.md`.

## Rodar

```bash
npm install
docker compose up -d
npm run dev
```

O banco é Postgres, em `localhost:5432`. O modelo das variáveis está em `.env.example`. Na primeira vez, `npm run db:import` copia o SQLite antigo de `data/shieldpath.db`, se esse arquivo existir e o Postgres ainda estiver vazio.

Sem `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`, entrar com Google avisa que falta a configuração.
