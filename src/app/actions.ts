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

interface GenkitMessage {
  role: 'user' | 'model';
  content: Part[];
}

interface ContextFile {
  fileName: string;
  fileDataUri: string;
}

export async function getAiResponse(
  queryText: string,
  history: GenkitMessage[],
  tutorMode: 'math' | 'geogebra' | 'stepByStep' | 'socratic',
  imageQueryDataUri?: string,
  // Changed: receive IDs instead of content to avoid payload limits
  activeFileParams?: { ids: { type: 'group' | 'single', id: string }[], userId: string },
): Promise<MathAssistantOutput> {

  const activeContextFiles: ContextFile[] = [];

  // Fetch content from Firestore if IDs are provided
  if (activeFileParams && activeFileParams.ids.length > 0 && activeFileParams.userId) {
    try {
        const firestore = getFirestore();
        const messagesRef = firestore.collection('users').doc(activeFileParams.userId).collection('messages');

        for (const item of activeFileParams.ids) {
            let contentParts: { part: number, content: string, fileName: string }[] = [];
            let fileName = 'Archivo';

            if (item.type === 'group') {
                // Fetch all parts of the group
                const q = messagesRef.where('groupId', '==', item.id).orderBy('partNumber');
                const snapshot = await q.get();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    contentParts.push({ 
                        part: data.partNumber || 1, 
                        content: data.content,
                        fileName: data.fileName.replace(/ - Parte \d+\/\d+$/, '')
                    });
                    fileName = data.fileName.replace(/ - Parte \d+\/\d+$/, '');
                });
            } else {
                // Fetch single doc
                const docSnap = await messagesRef.doc(item.id).get();
                if (docSnap.exists) {
                    const data = docSnap.data();
                    contentParts.push({ part: 1, content: data?.content, fileName: data?.fileName });
                    fileName = data?.fileName;
                }
            }

            // Reassemble
            if (contentParts.length > 0) {
                // Sort just in case (though query was sorted)
                contentParts.sort((a, b) => a.part - b.part);
                const fullContent = contentParts.map(p => p.content).join('');
                activeContextFiles.push({
                    fileName: fileName,
                    fileDataUri: fullContent
                });
            }
        }
    } catch (error) {
        console.error("Error fetching context files from Firestore:", error);
        // Continue without context if fetch fails, but log it
    }
  }

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

    // Save to Firestore on the SERVER SIDE
    const fileContent = result.extractedContent || result.visualDescription || '';
    const messagesRef = firestore.collection('users').doc(userId).collection('messages');
    
    // Chunking logic (same as client)
    const CHUNK_SIZE = 900000; 
    
    if (fileContent.length > CHUNK_SIZE) {
        const totalParts = Math.ceil(fileContent.length / CHUNK_SIZE);
        const groupId = `group-${Date.now()}`;
        const batch = firestore.batch();

        for (let i = 0; i < totalParts; i++) {
            const chunkContent = fileContent.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const docRef = messagesRef.doc(); // Auto ID
            
            const fileMessageData = {
                role: 'user',
                type: 'fileContext',
                content: chunkContent,
                fileName: `${result.fileName} - Parte ${i + 1}/${totalParts}`,
                isActive: true,
                createdAt: new Date(), // Use server date
                groupId,
                partNumber: i + 1,
                totalParts,
                // Metadata
                driveFileId: result.driveFileId,
                mimeType: result.mimeType,
                fileSize: result.fileSize
            };
            batch.set(docRef, fileMessageData);
        }
        await batch.commit();
    } else {
        // Single file
        await messagesRef.add({
            role: 'user',
            type: 'fileContext',
            content: fileContent,
            fileName: result.fileName,
            isActive: true,
            createdAt: new Date(),
            // Metadata
            driveFileId: result.driveFileId,
            mimeType: result.mimeType,
            fileSize: result.fileSize,
            summary: result.contentSummary
        });
    }

    return {
      success: true,
      data: { ...result, savedToServer: true }, // Indicate it was saved
    };
  } catch (error) {
    console.error('Error in processGoogleDriveFile server action:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al procesar archivo',
    };
  }
}
