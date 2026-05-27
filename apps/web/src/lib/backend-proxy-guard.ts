/** Caminhos sensíveis — validação extra no proxy Next (camada além da API). */
export function validateAdminSetupProxy(
  method: string,
  pathSegments: string[] | undefined,
  request: Request,
): Response | null {
  const isSetup =
    method === "POST" &&
    pathSegments?.[0] === "admin" &&
    pathSegments?.[1] === "auth" &&
    pathSegments?.[2] === "setup";
  if (!isSetup) return null;

  const isProd =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  if (!isProd) return null;

  const setupToken = process.env.ADMIN_SETUP_TOKEN?.trim();
  if (!setupToken) {
    return Response.json(
      {
        error:
          "Defina ADMIN_SETUP_TOKEN na Vercel antes do primeiro acesso ao painel admin.",
        code: "ADMIN_SETUP_TOKEN_REQUIRED",
      },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-admin-setup-token")?.trim();
  if (provided !== setupToken) {
    return Response.json(
      { error: "Token de configuração do admin inválido." },
      { status: 403 },
    );
  }

  return null;
}
