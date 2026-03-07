import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { Config } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawConfigPath = path.resolve(__dirname, "../raw/config.json");

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const raw = fs.readFileSync(rawConfigPath, "utf-8");
  cachedConfig = JSON.parse(raw) as Config;
  return cachedConfig;
}

export const config = loadConfig();

export function validateRepository(repo: string): string {
  const matchedRepo = config.repos.find((_repo: string) => _repo === repo);
  if (!matchedRepo) {
    throw new Error(`${repo}를 찾지 못했어요.`);
  }

  return matchedRepo;
}
