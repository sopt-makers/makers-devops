import path from "path";
import { fileURLToPath } from "url";
import fsp from "fs/promises";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.relative(dirname, "./store.json");

interface NewsState {
  lastPublishedAt: string;
  recentIds: string[];
}

export const loadStates = async () => {
  try {
    const raw = await fsp.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as NewsState;
  } catch (error) {
    console.error(error);
    return {
      lastPublishedAt: "",
      recentIds: [],
    };
  }
};

export const saveStates = async (lastPublishedAt: string, ids: string[]) => {
  const state: NewsState = {
    lastPublishedAt,
    recentIds: ids,
  };

  await fsp.writeFile(STORE_PATH, JSON.stringify(state, null, 2));
};
