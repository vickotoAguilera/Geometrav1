'use server';

import { textToSpeech } from "@/ai/flows/tts-flow";
import { TextToSpeechOutput } from "@/ai/flows/schemas/tts-schemas";

export async function generateSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}
