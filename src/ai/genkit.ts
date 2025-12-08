import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
<<<<<<< HEAD
  model: 'googleai/gemini-2.5-flash',
=======
  model: 'googleai/gemini-2.0-flash',
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
});
