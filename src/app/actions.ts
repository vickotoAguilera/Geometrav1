'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import { Part } from 'genkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra',
  fileContent?: string,
  fileName?: string
): Promise<MathAssistantOutput> {

  const input = {
    query: queryText,
    history: history,
    tutorMode: tutorMode,
    fileDataUri: fileContent,
    fileName: fileName,
  };

  return await mathAssistant(input);
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
