'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import {
  getStorage,
  ref as storageRef,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getSdks, initializeFirebase } from '@/firebase';

interface Message {
  role: 'user' | 'model';
  content: { text: string }[];
}

export async function getAiResponse(
  query: string,
  history: Message[],
  photoDataUri?: string
): Promise<MathAssistantOutput> {
  return await mathAssistant({ query, history, photoDataUri });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}

/**
 * Uploads a file to Firebase Storage, saves a reference in Firestore,
 * and extracts text content if it's a document.
 */
export async function uploadAndProcessDocument(
  fileDataUri: string,
  fileName: string,
  fileType: string,
  userId: string
): Promise<{ textContent: string; downloadUrl: string }> {
  // Ensure Firebase is initialized for server-side operations
  const { firestore, storage } = getSdks(initializeFirebase().firebaseApp);

  const [, mimeType, , fileContent] =
    /^data:(.+);(charset=.+;)?base64,(.*)$/.exec(fileDataUri) ?? [];
  if (!mimeType || !fileContent) {
    throw new Error('Invalid Data URI format.');
  }

  // 1. Upload to Firebase Storage
  const filePath = `user-uploads/${userId}/${Date.now()}-${fileName}`;
  const fileStorageRef = storageRef(storage, filePath);
  await uploadString(fileStorageRef, fileDataUri, 'data_url');
  const downloadUrl = await getDownloadURL(fileStorageRef);

  // 2. Save reference to Firestore
  const messagesRef = collection(firestore, 'users', userId, 'messages');
  await addDoc(messagesRef, {
    userId: userId,
    role: 'user',
    content: `Archivo adjunto: ${fileName}`,
    fileInfo: {
      name: fileName,
      type: fileType,
      path: filePath,
      downloadUrl: downloadUrl,
    },
    createdAt: serverTimestamp(),
  });

  // 3. Extract text content from the document
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
    } else if (mimeType.startsWith('image/')) {
      // For images, there's no text to extract initially.
      // The context will be handled by the AI's image processing.
      textContent = '';
    } else {
      textContent = `[Contenido de tipo ${mimeType} no se puede procesar todavía.]`;
    }
  } catch (error) {
    console.error('Error processing file for text extraction:', error);
    throw new Error('Failed to extract text from the document.');
  }

  return { textContent, downloadUrl };
}
