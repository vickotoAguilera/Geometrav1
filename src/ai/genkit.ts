import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Usar la primera API key (verificada como funcionando)
const API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_GENAI_API_KEY_2;

if (!API_KEY) {
  console.error("❌ CRITICAL: GOOGLE_GENAI_API_KEY is missing in server environment!");
  // We don't throw here to avoid build crashes, but the app will likely fail at runtime
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
