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
  history: GenkitMessage[],
  photoDataUri?: string
): Promise<MathAssistantOutput> {
  const finalHistory = [...history];
  const userMessage: Part[] = [{ text: query }];
  if (photoDataUri) {
    userMessage.push({ media: { url: photoDataUri } });
  }
  
  // This logic is now handled in the flow
  // finalHistory.push({ role: 'user', content: userMessage });

  return await mathAssistant({
    query: query,
    history: finalHistory,
    photoDataUri: photoDataUri,
  });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
