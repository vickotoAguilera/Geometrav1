'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import { Part } from 'genkit';
import { processGoogleDriveFile as processFile } from '@/lib/file-processor';
import { getFirestore } from '@/firebase/server';
import { cookies } from 'next/headers';
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra' | 'stepByStep' | 'socratic',
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
<<<<<<< HEAD

/**
 * Server action para procesar archivos de Google Drive
 * @param driveFileId - ID del archivo en Google Drive
 * @param userId - ID del usuario autenticado
 * @param accessToken - Token de acceso de Google OAuth
 * @returns Resultado del procesamiento con contenido
 */
export async function processGoogleDriveFile(
  driveFileId: string,
  userId: string,
  accessToken: string
): Promise<{
  success: boolean;
  data?: any; // Datos procesados del archivo
  error?: string
}> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'Usuario no autenticado',
      };
    }

    // Obtener Firestore (ya no se usa, pero se mantiene por compatibilidad)
    const firestore = getFirestore();

    // Procesar archivo - ahora retorna contenido en lugar de guardar
    const result = await processFile(
      driveFileId,
      userId,
      accessToken,
      firestore as any
    );

    return {
      success: true,
      data: result, // Retornar todos los datos procesados
    };
  } catch (error) {
    console.error('Error in processGoogleDriveFile server action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al procesar archivo',
    };
  }
}
=======
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
