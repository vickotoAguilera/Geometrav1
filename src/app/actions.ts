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

export async function getAiResponse(
  query: string,
  history: GenkitMessage[]
): Promise<MathAssistantOutput> {

  return await mathAssistant({
    query: query,
    history: history,
  });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
