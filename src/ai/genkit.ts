import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Usar la primera API key (verificada como funcionando)
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

export const ai = genkit({
  plugins: [googleAI({ apiKey: API_KEY })],
  model: 'googleai/gemini-2.5-flash',
});
