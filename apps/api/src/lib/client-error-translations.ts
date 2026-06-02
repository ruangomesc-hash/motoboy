export type AdminErrorSeverity = "info" | "warning" | "critical";

export type AdminErrorTranslation = {
  title: string;
  detail: string;
  action: string;
  severity: AdminErrorSeverity;
};

const TRANSLATIONS: Record<
  string,
  Omit<AdminErrorTranslation, "detail"> & { detail?: string }
> = {
  JWT_EXPIRED: {
    title: "Sessão expirada",
    detail:
      "O token JWT do motoboy expirou (validade de 30 dias) ou a JWT_SECRET foi alterada no deploy, invalidando sessões antigas.",
    action:
      "Peça para o motoboy sair e entrar de novo (WhatsApp ou senha). Se muitos usuários falharem ao mesmo tempo, confira JWT_SECRET na Railway/Vercel.",
    severity: "warning",
  },
  JWT_INVALID: {
    title: "Token de sessão inválido",
    detail:
      "O app enviou um token que a API não consegue validar — assinatura incorreta, token corrompido ou JWT_SECRET diferente entre web e API.",
    action:
      "Motoboy deve fazer logout e login. Verifique se JWT_SECRET é idêntico na Vercel (web) e Railway (API).",
    severity: "critical",
  },
  NOT_AUTHENTICATED: {
    title: "Requisição sem autenticação",
    detail:
      "A chamada chegou na API sem cookie motoboy-token nem header Authorization Bearer.",
    action:
      "Motoboy precisa estar logado. Se persistir, limpar cookies do site e entrar novamente.",
    severity: "warning",
  },
  ADMIN_TOKEN_ON_APP: {
    title: "Token de admin usado no app",
    detail:
      "Um token de administrador foi enviado em rota de motoboy (/me/*).",
    action: "Motoboy deve usar login normal, não credenciais do painel admin.",
    severity: "info",
  },
  SESSION_INVALID: {
    title: "Sessão sem identificação de usuário",
    detail: "O JWT decodificou, mas não contém userId válido.",
    action: "Novo login do motoboy.",
    severity: "warning",
  },
  USER_NOT_FOUND: {
    title: "Conta removida ou inexistente",
    detail:
      "O token ainda é válido, mas o usuário não existe mais no banco (conta apagada ou banco restaurado).",
    action: "Motoboy precisa se cadastrar novamente ou contatar suporte.",
    severity: "critical",
  },
  ACCOUNT_CANCELED: {
    title: "Conta cancelada",
    detail: "Usuário com status CANCELED tentou usar o app.",
    action: "Reativar conta no painel admin ou orientar contato com suporte.",
    severity: "warning",
  },
  SUBSCRIPTION_REQUIRED: {
    title: "Trial encerrado — assinatura necessária",
    detail:
      "Período de teste acabou e não há assinatura ativa; API bloqueou com HTTP 402.",
    action: "Enviar link de pagamento ou estender trial no admin.",
    severity: "info",
  },
  CORS_FORBIDDEN: {
    title: "Origem do navegador bloqueada (CORS)",
    detail:
      "O domínio de onde o app foi aberto não está em APP_URL / NEXTAUTH_URL.",
    action: "Confira variáveis de URL na Vercel e Railway; inclua domínio de produção.",
    severity: "critical",
  },
  PRISMA_VALIDATION: {
    title: "Dados inválidos no banco",
    detail: "Prisma rejeitou campos da entrega ou cadastro.",
    action: "Ver detalhe técnico; corrigir payload ou migration pendente.",
    severity: "warning",
  },
  PRISMA_ENGINE_MISSING: {
    title: "Prisma sem query engine no deploy",
    detail: "Runtime da API não encontrou o binário do Prisma.",
    action: "Redeploy da API (Railway) no commit mais recente.",
    severity: "critical",
  },
  DELIVERY_SAVE_FAILED: {
    title: "Falha ao salvar entrega",
    detail:
      "POST /me/deliveries falhou — geralmente conexão com Supabase ou timeout.",
    action: "Confira DATABASE_URL, status Supabase e logs da Railway.",
    severity: "critical",
  },
  VALIDATION_ERROR: {
    title: "Validação de formulário",
    detail: "Campos enviados não passaram na validação Zod.",
    action: "Conferir valor, origem, data e telefone informados pelo motoboy.",
    severity: "info",
  },
  INTERNAL_ERROR: {
    title: "Erro interno não tratado",
    detail: "Exceção não mapeada na API.",
    action: "Ver logs da Railway no horário do erro.",
    severity: "critical",
  },
  NETWORK_ERROR: {
    title: "Sem conexão com a API",
    detail:
      "O app não conseguiu completar a requisição (rede, DNS, API offline ou proxy Vercel).",
    action: "Confira status Railway/Vercel e /admin/status.",
    severity: "critical",
  },
  SERVER_UNAVAILABLE: {
    title: "Servidor indisponível (5xx)",
    detail: "API respondeu erro 500/502/503.",
    action: "Ver health da API, banco e Redis.",
    severity: "critical",
  },
  DATABASE_ERROR: {
    title: "Erro de banco de dados",
    detail: "Supabase/Postgres retornou erro na operação.",
    action: "Confira DATABASE_URL, migrations e painel Supabase.",
    severity: "critical",
  },
  MAPS_ERROR: {
    title: "Google Maps indisponível",
    detail: "Geocoding ou rotas falhou (chave, cota ou rede).",
    action: "Confira GOOGLE_MAPS_API_KEY e billing Google Cloud.",
    severity: "warning",
  },
  ASAAS_ERROR: {
    title: "Erro no Asaas (pagamento)",
    detail: "Integração de cobrança falhou.",
    action: "Confira ASAAS_API_KEY e webhook.",
    severity: "warning",
  },
  NEXTAUTH_ERROR: {
    title: "Falha no login NextAuth",
    detail: "Sessão web não foi criada após autenticação.",
    action: "Confira NEXTAUTH_SECRET, NEXTAUTH_URL e logs Vercel.",
    severity: "critical",
  },
  REDIS_QUEUE_ERROR: {
    title: "Fila WhatsApp (Redis) indisponível",
    detail: "REDIS_URL Upstash inacessível — fila de mensagens parada.",
    action: "Confira Upstash e REDIS_URL na Railway.",
    severity: "critical",
  },
};

function inferErrorCode(
  rawMessage: string,
  httpStatus?: number | null,
): string {
  const msg = rawMessage.toLowerCase();

  if (msg.includes("jwt expired") || msg.includes("token expired")) {
    return "JWT_EXPIRED";
  }
  if (
    msg.includes("token inválido") ||
    msg.includes("invalid token") ||
    msg.includes("jwt malformed")
  ) {
    return "JWT_INVALID";
  }
  if (msg.includes("não autenticado") || msg.includes("nao autenticado")) {
    return "NOT_AUTHENTICATED";
  }
  if (msg.includes("use login de motoboy")) {
    return "ADMIN_TOKEN_ON_APP";
  }
  if (msg.includes("conta não encontrada") || msg.includes("conta nao encontrada")) {
    return "USER_NOT_FOUND";
  }
  if (msg.includes("conta cancelada")) {
    return "ACCOUNT_CANCELED";
  }
  if (msg.includes("trial encerrado") || msg.includes("assine")) {
    return "SUBSCRIPTION_REQUIRED";
  }
  if (msg.includes("cors")) {
    return "CORS_FORBIDDEN";
  }
  if (msg.includes("não foi possível falar com o servidor")) {
    return "SERVER_UNAVAILABLE";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "NETWORK_ERROR";
  }
  if (msg.includes("supabase") || msg.includes("prisma") || msg.includes("banco")) {
    return "DATABASE_ERROR";
  }
  if (httpStatus === 402) return "SUBSCRIPTION_REQUIRED";
  if (httpStatus === 401) return "JWT_INVALID";
  if (httpStatus === 403) return "ACCOUNT_CANCELED";
  if (httpStatus != null && httpStatus >= 500) return "SERVER_UNAVAILABLE";

  return "UNKNOWN";
}

export function normalizeErrorCode(code?: string | null): string {
  if (!code?.trim()) return "UNKNOWN";
  return code.trim().toUpperCase();
}

export function resolveErrorCode(input: {
  code?: string | null;
  rawMessage: string;
  httpStatus?: number | null;
}): string {
  if (input.code?.trim()) return normalizeErrorCode(input.code);
  return inferErrorCode(input.rawMessage, input.httpStatus);
}

/** Tradução legível só para o painel admin — motoboy vê apenas rawMessage simplificado. */
export function translateErrorForAdmin(input: {
  code?: string | null;
  rawMessage: string;
  httpStatus?: number | null;
  route?: string | null;
}): AdminErrorTranslation {
  const code =
    input.code && input.code !== "UNKNOWN"
      ? normalizeErrorCode(input.code)
      : inferErrorCode(input.rawMessage, input.httpStatus);

  const mapped = TRANSLATIONS[code];
  if (mapped) {
    return {
      title: mapped.title,
      detail:
        mapped.detail ??
        `Mensagem técnica: ${input.rawMessage.slice(0, 500)}`,
      action: mapped.action,
      severity: mapped.severity,
    };
  }

  return {
    title: "Erro não catalogado",
    detail: input.rawMessage.slice(0, 800),
    action:
      "Analise a rota e o status HTTP; adicione mapeamento em client-error-translations se for recorrente.",
    severity:
      input.httpStatus != null && input.httpStatus >= 500
        ? "critical"
        : "warning",
  };
}

export function errorCodeLabel(code: string): string {
  return translateErrorForAdmin({ code, rawMessage: "" }).title;
}
