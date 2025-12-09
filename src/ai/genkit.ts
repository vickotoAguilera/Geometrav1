import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Usar la segunda API key por defecto (la primera fue reportada como filtrada)
const API_KEY = process.env.GOOGLE_GENAI_API_KEY_2 || process.env.GOOGLE_GENAI_API_KEY_3 || process.env.GOOGLE_GENAI_API_KEY;

export const ai = genkit({
  plugins: [googleAI({ apiKey: API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
