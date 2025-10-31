'use server';

import { siteGuideAssistant, SiteGuideOutput } from '@/ai/flows/site-guide-assistant';
import { Part } from 'genkit';

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

export async function getSiteGuideResponse(
  queryText: string,
  history: GenkitMessage[]
): Promise<SiteGuideOutput> {

  const input = {
    query: queryText,
    history: history,
  };

  return await siteGuideAssistant(input);
}
