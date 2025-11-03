'use server';

import { 
    funcionesMatricesAssistant, 
    type FuncionesMatricesAssistantInput, 
    type FuncionesMatricesAssistantOutput 
} from '@/ai/flows/funciones-matrices-assistant';
import { textToSpeech } from "@/ai/flows/tts-flow";
import { TextToSpeechOutput } from "@/ai/flows/schemas/tts-schemas";
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReact from 'rehype-react';
import {createElement} from 'react';
import { MarkdownImage } from '@/components/markdown-image';
import { renderToString } from 'react-dom/server';

export async function getFuncionesMatricesAiResponse(
  input: FuncionesMatricesAssistantInput
): Promise<FuncionesMatricesAssistantOutput> {
  return await funcionesMatricesAssistant(input);
}

export async function generateFuncionesMatricesSpeech(text: string): Promise<TextToSpeechOutput> {
    return await textToSpeech(text);
}

// Custom component mapping for rehype-react
const components = {
  // Map markdown `img` tags to our custom `MarkdownImage` component
  img: (props: any) => {
    // The path from markdown might be URL encoded, so we decode it.
    const decodedSrc = decodeURIComponent(props.src);
    return createElement(MarkdownImage, { src: decodedSrc, alt: props.alt });
  },
};

export async function getGuiaEjercicio(ejercicioId: string): Promise<{ content: string; htmlContent: string } | { error: string }> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'content', 'guias-geogebra', `${ejercicioId}.md`);
    if (!fs.existsSync(filePath)) {
      return { error: `La guía '${ejercicioId}.md' no fue encontrada.` };
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContents);
    
    // Process markdown to a React element structure first
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      // @ts-ignore - rehype-react has some type mismatch issues with modern React but works fine
      .use(rehypeReact, { createElement, components })
      .process(content);

    // Render the React structure to an HTML string on the server
    const htmlContent = renderToString(processedContent.result as React.ReactElement);

    return { content, htmlContent };
  } catch (error) {
    console.error(`Error reading or processing guide for ${ejercicioId}:`, error);
    return { error: 'No se pudo cargar el contenido de la guía.' };
  }
}
