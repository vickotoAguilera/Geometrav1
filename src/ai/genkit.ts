import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GEMINI_API_KEY })
  ],
  model: 'googleai/gemini-3.6-flash',
});


