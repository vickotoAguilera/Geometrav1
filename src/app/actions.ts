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
  fileDataUri: string;
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra',
  imageQueryDataUri?: string,
  activeContextFiles?: ContextFile[]
): Promise<MathAssistantOutput> {
  const queryParts: Part[] = [{ text: queryText }];

  if (imageQueryDataUri) {
    queryParts.push({
      media: {
        url: imageQueryDataUri,
      },
    });
  }

  // Prepend context files to the prompt for the LLM
  if (activeContextFiles && activeContextFiles.length > 0) {
    activeContextFiles.forEach(file => {
      queryParts.unshift({
        media: {
          url: file.fileDataUri,
        },
      });
      queryParts.unshift({ text: `**Context File: ${file.fileName}**` });
    });
  }

  const input = {
    query: queryParts,
    history: history,
    tutorMode: tutorMode,
  };

  return await mathAssistant(input);
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}
