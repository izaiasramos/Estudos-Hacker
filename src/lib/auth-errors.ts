const ERRORS: Record<string, string> = {
  email: "Informe um e-mail válido.",
  senha: "A senha precisa ter pelo menos 8 caracteres e não pode ser uma senha comum.",
  existe: "Já existe uma conta com este e-mail. Entre com a senha.",
  credenciais: "E-mail ou senha não conferem.",
  bloqueado:
    "Muitas tentativas seguidas. O login fica pausado por até 15 minutos.",
  origem: "Não foi possível confirmar a origem do pedido.",
  "google-config":
    "O Google ainda não está configurado neste ambiente. Use e-mail e senha, ou defina as credenciais no servidor.",
  "google-estado": "A autorização do Google expirou. Tente de novo.",
  "google-conta":
    "Já existe uma conta com este e-mail. Entre com a senha. As contas não se misturam sozinhas.",
};

export function authError(code: string | undefined) {
  if (!code) return null;
  return ERRORS[code] ?? null;
}
