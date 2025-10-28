'use server';

/**
 * @fileoverview A Genkit flow for processing uploaded documents (PDF, TXT, DOCX)
 * and extracting their text content.
 *
 * - processDocument - A flow that takes a file's data URI and extracts text.
 * - ProcessDocumentInput - The input type for the processDocument flow.
 * - ProcessDocumentOutput - The return type for the processDocument flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const ProcessDocumentInputSchema = z.object({
  fileDataUri: z.string().describe(
    "The content of the file as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ProcessDocumentInput = z.infer<typeof ProcessDocumentInputSchema>;

const ProcessDocumentOutputSchema = z.object({
  textContent: z.string().describe('The extracted text content from the document.'),
});
export type ProcessDocumentOutput = z.infer<typeof ProcessDocumentOutputSchema>;

export async function processDocument(input: ProcessDocumentInput): Promise<ProcessDocumentOutput> {
  return processDocumentFlow(input);
}

const processDocumentFlow = ai.defineFlow(
  {
    name: 'processDocumentFlow',
    inputSchema: ProcessDocumentInputSchema,
    outputSchema: ProcessDocumentOutputSchema,
  },
  async ({ fileDataUri }) => {
    const
     [, MimeType, , fileContent] = /^data:(.+);(charset=.+;)?base64,(.*)$/.exec(
      fileDataUri
    ) ?? ([] as string[]);

    if (!MimeType || !fileContent) {
      throw new Error('Invalid Data URI format.');
    }

    const buffer = Buffer.from(fileContent, 'base64');
    let textContent = '';

    try {
      if (MimeType === 'application/pdf') {
        const data = await pdf(buffer);
        textContent = data.text;
      } else if (MimeType.startsWith('text/')) {
        textContent = buffer.toString('utf-8');
      } else if (MimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const { value } = await mammoth.extractRawText({ buffer });
        textContent = value;
      } else {
        textContent = `[Contenido de tipo ${MimeType} no se puede procesar todavía.]`;
      }
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error('Failed to extract text from the document.');
    }

    return {
      textContent,
    };
  }
);
