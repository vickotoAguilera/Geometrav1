'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import { Part } from 'genkit';

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface ContextFile {
    fileName: string;
    downloadUrl: string;
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra',
  imageQueryDataUri?: string,
  activeContextFiles?: ContextFile[],
): Promise<MathAssistantOutput> {

  const input = {
    query: queryText,
    history: history,
    tutorMode: tutorMode,
    imageQueryDataUri: imageQueryDataUri,
    activeContextFiles: activeContextFiles,
  };

  return await mathAssistant(input);
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
