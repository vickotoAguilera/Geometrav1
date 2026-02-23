import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { groq } from 'genkitx-groq';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GEMINI_API_KEY || !GROQ_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY or GROQ_API_KEY is missing in server environment!");
}

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: GEMINI_API_KEY }),
    groq({ apiKey: GROQ_API_KEY })
  ],
  model: 'groq/llama-3.3-70b-versatile',
});
