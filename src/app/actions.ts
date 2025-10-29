'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';

interface GenkitMessage {
  role: 'user' | 'model';
  content: { text: string }[];
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra'
): Promise<MathAssistantOutput> {
  const input = {
    query: queryText,
    history: history,
    tutorMode: tutorMode,
  };
  return await mathAssistant(input);
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
