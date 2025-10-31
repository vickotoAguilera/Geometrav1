'use server';

import { screenshotAssistant, ScreenshotAssistantOutput, ScreenshotAssistantInput } from '@/ai/flows/screenshot-assistant';

/**
 * Calls the screenshot assistant Genkit flow.
 * @param input The input for the flow, including history, query, and optional screenshot.
 * @returns The AI's response.
 */
export async function getScreenshotVozAiResponse(
  input: ScreenshotAssistantInput
): Promise<ScreenshotAssistantOutput> {
  return await screenshotAssistant(input);
}
