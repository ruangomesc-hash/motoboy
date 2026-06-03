/** Mensagem amigável para erros de sessão vindos da API. */
export function friendlyAuthErrorMessage(
  message: string,
  code?: string,
): string {
  if (
    code === "JWT_INVALID" ||
    /token inválido/i.test(message)
  ) {
    return "Sessão inválida. Saia do app, entre de novo com senha ou código no WhatsApp.";
  }
  if (
    code === "JWT_EXPIRED" ||
    /sessão expirada/i.test(message)
  ) {
    return "Sessão expirada. Faça login novamente.";
  }
  if (code === "NOT_AUTHENTICATED" || /não autenticado/i.test(message)) {
    return "Você não está logado. Abra o app e entre de novo.";
  }
  if (code === "USER_NOT_FOUND") {
    return "Conta não encontrada. Faça login ou crie seu cadastro.";
  }
  return message;
}
