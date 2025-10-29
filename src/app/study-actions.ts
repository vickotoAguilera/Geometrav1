'use server';

import { studyAssistant, StudyAssistantOutput } from '@/ai/flows/study-assistant';
import { Part } from 'genkit';

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

export async function getStudyAiResponse(
  queryText: string,
  history: GenkitMessage[],
  studyMaterial: string,
): Promise<StudyAssistantOutput> {

  const input = {
    query: queryText,
    history: history,
    studyMaterial: studyMaterial,
  };

  return await studyAssistant(input);
}
