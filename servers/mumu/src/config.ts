import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { Config } from "./types";
import { CHANNELS } from "./constant";

export const SERVICES = {
  crew: {
    name: "Crew",
    path: ".github/workflows/crew-deploy-production.yml",
    channel: CHANNELS.CREW,
    url: "https://playground.sopt.org/group/",
  },
  playground: {
    name: "Playground",
    path: ".github/workflows/playground-deploy-production.yml",
    channel: CHANNELS.PLAYGROUND,
    url: "https://playground.sopt.org/",
  },
} as const;

export type Service = keyof typeof SERVICES;

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

export function isValidRepository(repo: string | null | undefined) {
  if (repo == null) return false;

  return config.frontend.repos.includes(repo);
}
