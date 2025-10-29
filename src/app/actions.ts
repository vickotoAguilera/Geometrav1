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
  fileContent?: string,
  fileName?: string
): Promise<MathAssistantOutput> {

  // If fileContent is provided, we pass it to the flow.
  if (fileContent && fileName) {
     return await mathAssistant({
        query: queryText,
        history: history,
        fileDataUri: fileContent, // Assuming fileContent is a data URI
        fileName: fileName,
      });
  }

  // If not, just send the query.
  return await mathAssistant({
    query: queryText,
    history: history,
  });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
