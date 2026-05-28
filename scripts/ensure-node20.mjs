const rawVersion = process.versions.node ?? "";
const [major] = rawVersion.split(".");
const majorNumber = Number(major);

if (majorNumber !== 20) {
  console.error(
    `[node-version] Projeto exige Node 20.x (atual: v${rawVersion}).`,
  );
  console.error(
    "[node-version] Rode: nvm use 20  (ou nvm install 20 && nvm use 20)",
  );
  process.exit(1);
}
