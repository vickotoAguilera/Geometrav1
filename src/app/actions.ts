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


export async function uploadFileAction(fileDataUri: string, fileName: string, userId: string): Promise<{ downloadURL: string }> {
  const fileContent = fileDataUri.split(',')[1];
  
  // This endpoint points to the Firebase Function.
  // In a local environment, this might be http://localhost:5001/your-project/us-central1/uploadFile
  // In production, it will be your Firebase Cloud Function URL.
  // The URL should be configured as an environment variable for portability.
  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_FUNCTION_URL || 'http://127.0.0.1:5001/geogebra-476523/us-central1/uploadFile';

  const response = await fetch(`${uploadUrl}?uid=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-File-Name': encodeURIComponent(fileName)
    },
    body: Buffer.from(fileContent, 'base64'),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`File upload failed: ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}
