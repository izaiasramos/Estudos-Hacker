import type { ReactNode } from "react";

/**
 * `<Diagram name="hash" />` desenha um esquema em SVG dentro do texto da unidade.
 * Cada diagrama conta uma ideia só, com poucas caixas e setas. Os nomes ficam em DIAGRAMS.
 */

type Tone = "neutral" | "accent" | "defense" | "danger" | "info";

const TONES: Record<Tone, { stroke: string; fill: string; text: string }> = {
  neutral: { stroke: "stroke-line-strong", fill: "fill-surface-raised", text: "fill-text" },
  accent: { stroke: "stroke-accent", fill: "fill-accent/10", text: "fill-accent" },
  defense: { stroke: "stroke-defense", fill: "fill-defense/10", text: "fill-defense" },
  danger: { stroke: "stroke-danger", fill: "fill-danger/10", text: "fill-danger" },
  info: { stroke: "stroke-info", fill: "fill-info/10", text: "fill-info" },
};

function Svg({ id, height, title, children }: { id: string; height: number; title: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      <svg viewBox={`0 0 720 ${height}`} role="img" aria-label={title} className="w-full rounded-[16px] border border-white/10 bg-ink/60 font-sans">
        <title>{title}</title>
        <defs>
          {(["neutral", "accent", "defense", "danger", "info"] as Tone[]).map((tone) => (
            <marker key={tone} id={`${id}-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className={TONES[tone].text} />
            </marker>
          ))}
        </defs>
        {children}
      </svg>
    </figure>
  );
}

function Text({ x, y, lines, size = 15, tone = "neutral", anchor = "middle", weight = 500, mono = false }: {
  x: number; y: number; lines: string[]; size?: number; tone?: Tone; anchor?: "start" | "middle" | "end"; weight?: number; mono?: boolean;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} className={`${TONES[tone].text} ${mono ? "font-mono" : ""}`}>
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : size * 1.35}>{line}</tspan>
      ))}
    </text>
  );
}

function Box({ x, y, w, h, title, sub, tone = "neutral", mono = false }: {
  x: number; y: number; w: number; h: number; title: string[]; sub?: string[]; tone?: Tone; mono?: boolean;
}) {
  const t = TONES[tone];
  const titleSize = 16;
  const subSize = 14;
  const total = title.length * titleSize * 1.35 + (sub ? sub.length * subSize * 1.35 + 4 : 0);
  const top = y + (h - total) / 2 + titleSize;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} className={`${t.fill} ${t.stroke}`} strokeWidth={1.6} />
      <Text x={x + w / 2} y={top} lines={title} size={titleSize} tone={tone === "neutral" ? "neutral" : tone} weight={700} />
      {sub ? <Text x={x + w / 2} y={top + title.length * titleSize * 1.35 + 4} lines={sub} size={subSize} mono={mono} tone="neutral" weight={500} /> : null}
    </g>
  );
}

function Arrow({ id, x1, y1, x2, y2, tone = "neutral", dashed = false }: { id: string; x1: number; y1: number; x2: number; y2: number; tone?: Tone; dashed?: boolean }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} className={tone === "neutral" ? "stroke-muted" : TONES[tone].stroke} strokeWidth={2.2} strokeDasharray={dashed ? "7 6" : undefined} markerEnd={`url(#${id}-${tone})`} />
  );
}

function Badge({ x, y, label, tone }: { x: number; y: number; label: string; tone: Tone }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} className={`${TONES[tone].fill} ${TONES[tone].stroke}`} strokeWidth={1.6} />
      <Text x={x} y={y + 6} lines={[label]} size={17} tone={tone} weight={800} />
    </g>
  );
}

function Hash() {
  const id = "hash";
  return (
    <Svg id={id} height={330} title="A senha entra numa função de hash e vira um código. Do código não dá para voltar à senha.">
      <Box x={20} y={50} w={170} h={90} title={["Senha"]} sub={["pizza123"]} mono />
      <Box x={275} y={30} w={170} h={130} title={["Função de hash"]} sub={["uma conta que só", "anda para frente"]} tone="accent" />
      <Box x={530} y={50} w={170} h={90} title={["Código (hash)"]} sub={["9f2c71…b4a0"]} tone="defense" mono />
      <Arrow id={id} x1={192} y1={95} x2={273} y2={95} tone="accent" />
      <Arrow id={id} x1={447} y1={95} x2={528} y2={95} tone="defense" />
      <path d="M615 145 L615 205 L105 205 L105 148" fill="none" className="stroke-danger" strokeWidth={2.2} strokeDasharray="7 6" markerEnd={`url(#${id}-danger)`} />
      <rect x={250} y={188} width={220} height={34} rx={17} className="fill-ink stroke-danger" strokeWidth={1.6} />
      <Text x={360} y={211} lines={["✕ Voltar é impossível"]} tone="danger" size={15} weight={700} />
      <Text x={360} y={262} lines={["Mesma senha → sempre o mesmo código.", "Senha diferente → um código totalmente diferente."]} size={15} />
      <Text x={360} y={314} lines={["Por isso o site guarda o código e não a senha."]} tone="accent" size={15} weight={700} />
    </Svg>
  );
}

function Salt() {
  const id = "salt";
  return (
    <Svg id={id} height={290} title="Duas pessoas com a mesma senha recebem sal diferente e, por isso, guardam códigos diferentes.">
      <Box x={20} y={30} w={150} h={80} title={["Ana"]} sub={["senha: pizza123"]} />
      <Box x={20} y={170} w={150} h={80} title={["Bia"]} sub={["senha: pizza123"]} />
      <Box x={235} y={30} w={170} h={80} title={["+ sal da Ana"]} sub={["k8Q2…"]} tone="info" mono />
      <Box x={235} y={170} w={170} h={80} title={["+ sal da Bia"]} sub={["x91M…"]} tone="info" mono />
      <Box x={500} y={30} w={200} h={80} title={["Código da Ana"]} sub={["7d1e09…"]} tone="defense" mono />
      <Box x={500} y={170} w={200} h={80} title={["Código da Bia"]} sub={["c40f6b…"]} tone="defense" mono />
      <Arrow id={id} x1={172} y1={70} x2={233} y2={70} />
      <Arrow id={id} x1={172} y1={210} x2={233} y2={210} />
      <Arrow id={id} x1={407} y1={70} x2={498} y2={70} tone="defense" />
      <Arrow id={id} x1={407} y1={210} x2={498} y2={210} tone="defense" />
      <Text x={360} y={147} lines={["Mesma senha, sais diferentes, códigos diferentes"]} tone="accent" size={15} weight={700} />
      <Text x={360} y={278} lines={["Quem roubar o banco não vê quem usa a mesma senha."]} size={14} />
    </Svg>
  );
}

function SqlSeparacao() {
  const id = "sql";
  return (
    <Svg id={id} height={400} title="Concatenar mistura valor e instrução num texto só. Parametrizar envia os dois separados.">
      <Text x={20} y={28} lines={["JEITO ERRADO: tudo colado num texto só"]} tone="danger" size={14} anchor="start" weight={800} />
      <Box x={20} y={42} w={150} h={80} title={["Formulário"]} sub={["email digitado"]} />
      <Box x={235} y={42} w={250} h={80} title={["Servidor cola tudo"]} sub={["SELECT … WHERE", "email = '" + "<email>" + "'"]} tone="danger" mono />
      <Box x={550} y={42} w={150} h={80} title={["Banco"]} sub={["lê o texto todo", "como instrução"]} tone="danger" />
      <Arrow id={id} x1={172} y1={82} x2={233} y2={82} tone="danger" />
      <Arrow id={id} x1={487} y1={82} x2={548} y2={82} tone="danger" />
      <line x1={20} y1={160} x2={700} y2={160} className="stroke-line" strokeWidth={1} />
      <Text x={20} y={196} lines={["JEITO CERTO: instrução e valor em pacotes separados"]} tone="defense" size={14} anchor="start" weight={800} />
      <Box x={20} y={212} w={150} h={80} title={["Formulário"]} sub={["email digitado"]} />
      <Box x={235} y={206} w={250} h={44} title={["Instrução fixa"]} tone="defense" />
      <Box x={235} y={258} w={250} h={44} title={["Valor (só dado)"]} tone="info" />
      <Box x={550} y={212} w={150} h={80} title={["Banco"]} sub={["ordem é ordem,", "dado é dado"]} tone="defense" />
      <Arrow id={id} x1={172} y1={252} x2={233} y2={252} />
      <Arrow id={id} x1={487} y1={228} x2={548} y2={236} tone="defense" />
      <Arrow id={id} x1={487} y1={280} x2={548} y2={268} tone="info" />
      <Text x={360} y={345} lines={["No jeito certo o banco nunca confunde o que é ordem com o que é dado."]} size={15} weight={600} />
      <Text x={360} y={370} lines={["O valor pode ser qualquer coisa. Ele só preenche a vaga (?)."]} size={14} />
    </Svg>
  );
}

function SessaoFluxo() {
  const id = "ses";
  return (
    <Svg id={id} height={360} title="Depois do login o servidor entrega uma chave. O navegador mostra a chave em cada pedido seguinte.">
      <Box x={20} y={20} w={150} h={50} title={["Navegador"]} />
      <Box x={550} y={20} w={150} h={50} title={["Servidor"]} />
      <line x1={95} y1={72} x2={95} y2={340} className="stroke-line-strong" strokeDasharray="4 6" />
      <line x1={625} y1={72} x2={625} y2={340} className="stroke-line-strong" strokeDasharray="4 6" />
      <Arrow id={id} x1={97} y1={110} x2={623} y2={110} />
      <Text x={360} y={100} lines={["1. Login: email + senha"]} size={14} />
      <Arrow id={id} x1={623} y1={170} x2={97} y2={170} tone="accent" />
      <Text x={360} y={160} lines={["2. “Aqui está a sua chave: abc123”"]} tone="accent" size={14} />
      <Arrow id={id} x1={97} y1={230} x2={623} y2={230} tone="info" />
      <Text x={360} y={220} lines={["3. Novo pedido + chave abc123"]} tone="info" size={14} />
      <Arrow id={id} x1={623} y1={290} x2={97} y2={290} tone="defense" />
      <Text x={360} y={280} lines={["4. “abc123 é da Alice, pode entrar”"]} tone="defense" size={14} />
      <Text x={360} y={335} lines={["O servidor guarda a lista: abc123 = Alice. A chave não é a senha."]} size={14} />
    </Svg>
  );
}

function Csrf() {
  const id = "csrf";
  return (
    <Svg id={id} height={330} title="Um site de fora faz o navegador da Alice enviar um pedido ao banco, e o navegador anexa o cookie sozinho.">
      <Box x={20} y={40} w={170} h={90} title={["Site de gatinhos"]} sub={["tem uma imagem", "escondida"]} tone="danger" />
      <Box x={275} y={40} w={170} h={90} title={["Navegador da Alice"]} sub={["já está logada", "no banco"]} />
      <Box x={530} y={40} w={170} h={90} title={["Banco"]} sub={["confere só o", "cookie"]} tone="info" />
      <Arrow id={id} x1={192} y1={85} x2={273} y2={85} tone="danger" />
      <Arrow id={id} x1={447} y1={85} x2={528} y2={85} tone="danger" />
      <Text x={232} y={170} lines={["1. “carregue", "esta imagem”"]} size={14} tone="danger" />
      <Text x={488} y={170} lines={["2. pedido “transferir”", "+ cookie da Alice,", "enviado sozinho"]} size={14} tone="danger" />
      <Text x={620} y={215} lines={["3. Cookie válido:"]} size={14} tone="danger" weight={700} />
      <Text x={620} y={235} lines={["transferiu!"]} size={14} tone="danger" weight={700} />
      <rect x={20} y={262} width={680} height={50} rx={12} className="fill-defense/10 stroke-defense" strokeWidth={1.4} />
      <Text x={360} y={283} lines={["A defesa: o banco exige também um token secreto, que só o site do banco conhece,"]} size={14} tone="defense" />
      <Text x={360} y={303} lines={["e confere de onde o pedido veio. O site de gatinhos não tem nenhum dos dois."]} size={14} tone="defense" />
    </Svg>
  );
}

function Idor() {
  const id = "idor";
  return (
    <Svg id={id} height={400} title="Sem filtro por dono, a Alice vê o pedido do Bruno. Com filtro, a rota responde que não encontrou.">
      <Text x={20} y={26} lines={["SEM filtro por dono"]} size={14} tone="danger" anchor="start" weight={800} />
      <Box x={20} y={40} w={170} h={80} title={["Alice (logada)"]} sub={["pede /pedidos/103"]} mono />
      <Box x={265} y={40} w={190} h={80} title={["Rota /pedidos"]} sub={["só olha o número"]} tone="danger" />
      <Box x={530} y={40} w={170} h={80} title={["Entrega o pedido"]} sub={["do Bruno ✕"]} tone="danger" />
      <Arrow id={id} x1={192} y1={80} x2={263} y2={80} />
      <Arrow id={id} x1={457} y1={80} x2={528} y2={80} tone="danger" />
      <Text x={20} y={166} lines={["COM filtro por dono"]} size={14} tone="defense" anchor="start" weight={800} />
      <Box x={20} y={180} w={170} h={80} title={["Alice (logada)"]} sub={["pede /pedidos/103"]} mono />
      <Box x={265} y={180} w={190} h={80} title={["Rota /pedidos"]} sub={["olha o número", "e quem é o dono"]} tone="defense" />
      <Box x={530} y={180} w={170} h={80} title={["Responde 404"]} sub={["nada revelado ✓"]} tone="defense" />
      <Arrow id={id} x1={192} y1={220} x2={263} y2={220} />
      <Arrow id={id} x1={457} y1={220} x2={528} y2={220} tone="defense" />
      <rect x={20} y={296} width={680} height={78} rx={12} className="fill-surface-raised stroke-line-strong" strokeWidth={1.4} />
      <Text x={36} y={324} lines={["SELECT * FROM pedidos", "WHERE id = 103  AND  dono = 'alice'   ← o dono vem da sessão, não da URL"]} size={14} mono anchor="start" />
    </Svg>
  );
}

function Ssrf() {
  const id = "ssrf";
  return (
    <Svg id={id} height={360} title="O usuário manda um endereço e o servidor busca. Se o endereço for interno, o servidor busca um lugar que o usuário não alcançaria.">
      <Box x={20} y={120} w={140} h={80} title={["Usuário"]} sub={["cola um link"]} />
      <Box x={225} y={110} w={170} h={100} title={["Servidor"]} sub={["prévia de link", "busca a página"]} tone="info" />
      <Arrow id={id} x1={162} y1={160} x2={223} y2={160} />
      <Text x={560} y={40} lines={["Endereço público"]} size={14} tone="defense" weight={800} />
      <Box x={475} y={52} w={225} h={64} title={["example.com"]} sub={["normal e esperado ✓"]} tone="defense" />
      <Arrow id={id} x1={397} y1={140} x2={473} y2={90} tone="defense" />
      <line x1={455} y1={150} x2={700} y2={150} className="stroke-danger" strokeDasharray="3 6" />
      <Text x={578} y={142} lines={["rede interna: o usuário não chega aqui"]} size={12} tone="danger" />
      <Box x={475} y={168} w={225} h={64} title={["127.0.0.1:9000"]} sub={["serviço interno ✕"]} tone="danger" />
      <Arrow id={id} x1={397} y1={180} x2={473} y2={200} tone="danger" />
      <Text x={360} y={285} lines={["Sem regras, o servidor vira uma ponte: o usuário pede, o servidor entra,", "e devolve o conteúdo de um lugar que estava protegido."]} size={14} />
      <Text x={360} y={338} lines={["Defesa: conferir o IP real do destino antes de conectar."]} size={14} tone="defense" weight={700} />
    </Svg>
  );
}

function Xss() {
  const id = "xss";
  return (
    <Svg id={id} height={320} title="O mesmo comentário. Com innerHTML o navegador lê como HTML e executa. Com textContent ele mostra como texto.">
      <Box x={20} y={90} w={190} h={90} title={["Comentário"]} sub={["<img onerror=…>"]} tone="neutral" mono />
      <Box x={420} y={30} w={280} h={80} title={["innerHTML = comentário"]} sub={["o navegador LÊ como HTML"]} tone="danger" />
      <Box x={420} y={160} w={280} h={80} title={["textContent = comentário"]} sub={["o navegador MOSTRA como texto"]} tone="defense" />
      <Arrow id={id} x1={212} y1={120} x2={418} y2={72} tone="danger" />
      <Arrow id={id} x1={212} y1={150} x2={418} y2={200} tone="defense" />
      <Text x={560} y={130} lines={["→ executa o código ✕"]} size={14} tone="danger" weight={700} />
      <Text x={560} y={260} lines={["→ aparece o texto na tela ✓"]} size={14} tone="defense" weight={700} />
      <Text x={360} y={300} lines={["Uma letra de diferença na função muda tudo: texto vira código ou continua texto."]} size={14} />
    </Svg>
  );
}

function Upload() {
  const id = "up";
  const steps = ["Limitar o tamanho", "Conferir o conteúdo", "Reprocessar a imagem", "Gerar nome novo", "Entregar por origem separada"];
  return (
    <Svg id={id} height={250} title="Cinco passos que o servidor faz antes de publicar um arquivo enviado por alguém.">
      {steps.map((label, index) => (
        <g key={label}>
          <rect x={14 + index * 140} y={40} width={124} height={96} rx={14} className="fill-defense/10 stroke-defense" strokeWidth={1.6} />
          <Badge x={14 + index * 140 + 62} y={40} label={String(index + 1)} tone="defense" />
          <Text x={14 + index * 140 + 62} y={86} lines={label.split(" ").length > 2 ? [label.split(" ").slice(0, 2).join(" "), label.split(" ").slice(2).join(" ")] : label.split(" ")} size={14} weight={700} />
          {index < steps.length - 1 ? <Arrow id={id} x1={140 + index * 140} y1={88} x2={152 + index * 140} y2={88} tone="defense" /> : null}
        </g>
      ))}
      <Text x={360} y={190} lines={["O cliente controla nome, extensão e tipo declarado: tudo isso pode mentir."]} size={14} />
      <Text x={360} y={216} lines={["Quem decide o que é o arquivo é o servidor."]} size={14} tone="defense" weight={700} />
    </Svg>
  );
}

function Headers() {
  const id = "hdr";
  return (
    <Svg id={id} height={330} title="A resposta do servidor traz campos que a tela esconde, mas todos chegaram ao navegador.">
      <rect x={20} y={20} width={330} height={210} rx={14} className="fill-surface-raised stroke-line-strong" strokeWidth={1.6} />
      <Text x={36} y={46} lines={["O que chegou ao navegador"]} size={14} weight={800} anchor="start" tone="info" />
      <Text x={36} y={80} lines={["name: \"Alice\""]} size={15} mono anchor="start" />
      <Text x={36} y={110} lines={["email: \"alice@lab.local\""]} size={15} mono anchor="start" />
      <Text x={36} y={140} lines={["password_hash: \"$2b$12…\""]} size={15} mono anchor="start" tone="danger" weight={700} />
      <Text x={36} y={170} lines={["reset_token: \"9f2c…\""]} size={15} mono anchor="start" tone="danger" weight={700} />
      <Text x={36} y={205} lines={["X-Powered-By: Express 4.17.1"]} size={14} mono anchor="start" tone="danger" weight={700} />
      <rect x={400} y={20} width={300} height={210} rx={14} className="fill-surface-raised stroke-line-strong" strokeWidth={1.6} />
      <Text x={416} y={46} lines={["O que a tela mostra"]} size={14} weight={800} anchor="start" tone="defense" />
      <Text x={416} y={90} lines={["Alice"]} size={22} anchor="start" weight={700} />
      <Text x={416} y={122} lines={["alice@lab.local"]} size={15} anchor="start" />
      <Text x={416} y={190} lines={["(o resto fica escondido)"]} size={13} anchor="start" />
      <Arrow id={id} x1={352} y1={125} x2={398} y2={125} />
      <Text x={360} y={268} lines={["Esconder na tela não apaga o dado: quem abre o F12 vê tudo o que chegou."]} size={14} />
      <Text x={360} y={300} lines={["Defesa: o servidor escolhe os campos ANTES de enviar."]} size={14} tone="defense" weight={700} />
    </Svg>
  );
}

function Phishing() {
  const id = "phi";
  const parts = [
    { text: "https://", w: 96, tone: "neutral" as Tone },
    { text: "shieldpath.app.", w: 156, tone: "danger" as Tone },
    { text: "verifica-conta.net", w: 204, tone: "accent" as Tone },
    { text: "/login", w: 70, tone: "neutral" as Tone },
  ];
  let x = 24;
  return (
    <Svg id={id} height={260} title="Em um link, o domínio verdadeiro é o trecho que vem logo antes da primeira barra, lido da direita para a esquerda.">
      <Text x={20} y={30} lines={["Link recebido:"]} size={14} anchor="start" />
      {parts.map((part) => {
        const pos = x;
        x += part.w + 4;
        return (
          <g key={part.text}>
            <rect x={pos} y={48} width={part.w} height={44} rx={8} className={`${TONES[part.tone].fill} ${TONES[part.tone].stroke}`} strokeWidth={1.6} />
            <Text x={pos + part.w / 2} y={76} lines={[part.text]} size={15} mono tone={part.tone} weight={700} />
          </g>
        );
      })}
      <Text x={204} y={125} lines={["isto é só enfeite", "(um nome falso na frente)"]} size={13} tone="danger" />
      <Text x={452} y={125} lines={["o dono REAL do site", "é o que está aqui"]} size={13} tone="accent" weight={700} />
      <Text x={360} y={190} lines={["Dica: leia o endereço até a primeira “/”. As duas últimas palavras antes dela", "(aqui, verifica-conta.net) dizem quem é o dono do site."]} size={14} />
      <Text x={360} y={236} lines={["Se não for o domínio oficial, não clique. Abra o app ou digite o endereço você mesmo."]} size={14} tone="defense" weight={700} />
    </Svg>
  );
}

const DIAGRAMS = {
  hash: Hash,
  salt: Salt,
  "sql-separacao": SqlSeparacao,
  "sessao-fluxo": SessaoFluxo,
  csrf: Csrf,
  idor: Idor,
  ssrf: Ssrf,
  xss: Xss,
  upload: Upload,
  headers: Headers,
  phishing: Phishing,
} as const;

export type DiagramName = keyof typeof DIAGRAMS;
export const DIAGRAM_NAMES = Object.keys(DIAGRAMS) as DiagramName[];

export function Diagram({ name }: { name: DiagramName }) {
  const Component = DIAGRAMS[name];
  return Component ? <Component /> : null;
}
