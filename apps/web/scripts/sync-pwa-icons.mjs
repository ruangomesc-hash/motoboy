#!/usr/bin/env node
/**
 * Redimensiona public/icons/app-icon.png (logo oficial) para PWA.
 * Se app-icon.png não existir, não faz nada (usa PNGs já versionados).
 */
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
const master = join(iconsDir, "app-icon.png");

if (!existsSync(master)) {
  console.log("[sync-pwa-icons] app-icon.png ausente — mantendo ícones existentes");
  process.exit(0);
}

if (process.platform !== "darwin") {
  console.log("[sync-pwa-icons] resize automático só no macOS (sips); PNGs no repo");
  process.exit(0);
}

for (const [size, name] of [
  [512, "icon-512.png"],
  [192, "icon-192.png"],
  [180, "apple-touch-icon.png"],
]) {
  execSync(`sips -z ${size} ${size} "${master}" --out "${join(iconsDir, name)}"`, {
    stdio: "inherit",
  });
}
console.log("[sync-pwa-icons] OK");
