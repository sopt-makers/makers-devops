import { GoogleGenAI } from "@google/genai";

export const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/** Gemini Free Tier */
export const GEMINI_MODEL = "gemini-3.1-flash-lite";
