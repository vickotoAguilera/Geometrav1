'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Helper function to initialize Firebase on the server if not already done.
// This ensures we have a single instance and uses the correct config.

export async function getAiResponse(
  query: string,
  photoDataUri?: string
): Promise<MathAssistantOutput> {
  return await mathAssistant({ query, photoDataUri });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}

async function extractTextFromDataUri(fileDataUri: string): Promise<string> {
  const [, mimeType, , fileContent] =
    /^data:(.+);(charset=.+;)?base64,(.*)$/.exec(fileDataUri) ?? [];
  if (!mimeType || !fileContent) {
    throw new Error('Invalid Data URI format for text extraction.');
  }

  const buffer = Buffer.from(fileContent, 'base64');
  let textContent = '';

  try {
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      textContent = data.text;
    } else if (mimeType.startsWith('text/')) {
      textContent = buffer.toString('utf-8');
    } else if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      textContent = value;
    } else {
      textContent = `[Contenido de tipo ${mimeType} no se puede procesar todavía.]`;
    }
  } catch (error) {
    console.error('Error processing file for text extraction:', error);
    throw new Error('Failed to extract text from the document.');
  }

  return textContent;
}

export async function processDocument(
  fileDataUri: string
): Promise<{ textContent: string }> {
  // 1. Extract text content
  const textContent = await extractTextFromDataUri(fileDataUri);

  return { textContent };
}
