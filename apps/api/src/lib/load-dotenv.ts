import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), "../../../.env"),
];

for (const file of envCandidates) {
  if (existsSync(file)) {
    config({ path: file });
  }
}
