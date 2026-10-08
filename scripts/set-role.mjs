// Muda o papel de uma conta. Não existe tela para isso de propósito: dar admin é ação de operação.
// Uso: DATABASE_URL=... node scripts/set-role.mjs pessoa@exemplo.com admin
//      DATABASE_URL=... node scripts/set-role.mjs pessoa@exemplo.com learner
import pg from "pg";

const ROLES = new Set(["learner", "mentor", "admin"]);
const [email, role] = process.argv.slice(2);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL ausente");
  process.exit(1);
}
if (!email || !ROLES.has(role)) {
  console.error("Uso: node scripts/set-role.mjs <email> <learner|mentor|admin>");
  process.exit(1);
}

const client = new pg.Client({ connectionString });
await client.connect();
try {
  const result = await client.query("UPDATE users SET role = $1 WHERE email = $2 RETURNING email, role", [
    role,
    email.trim().toLowerCase(),
  ]);
  if (result.rowCount === 0) {
    console.error(`Nenhuma conta com o e-mail ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`${result.rows[0].email} agora é ${result.rows[0].role}`);
  }
} finally {
  await client.end();
}
