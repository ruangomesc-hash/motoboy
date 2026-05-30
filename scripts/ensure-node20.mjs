const rawVersion = process.versions.node ?? "";
const [major] = rawVersion.split(".");
const majorNumber = Number(major);

/** Railway/Railpack às vezes sobe Node 22 antes de ler .nvmrc — não bloquear o deploy. */
const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_SERVICE_ID ||
    process.env.RAILWAY_PROJECT_ID,
);
if (onRailway && majorNumber >= 20 && majorNumber <= 22) {
  if (majorNumber !== 20) {
    console.warn(
      `[node-version] Railway Node ${rawVersion} — recomendado Node 20 (.nvmrc).`,
    );
  }
  process.exit(0);
}

if (majorNumber !== 20) {
  console.error(
    `[node-version] Projeto exige Node 20.x (atual: v${rawVersion}).`,
  );
  console.error(
    "[node-version] Rode: nvm use 20  (ou nvm install 20 && nvm use 20)",
  );
  process.exit(1);
}
