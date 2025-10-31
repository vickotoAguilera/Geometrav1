'use server';

import { textToSpeech, TextToSpeechOutput } from "@/ai/flows/tts-flow";

export async function generateSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}
