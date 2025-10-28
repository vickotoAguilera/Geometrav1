'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// Helper function to initialize Firebase on the server if not already done.
// This ensures we have a single instance and uses the correct config.
function getFirebaseForServer() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }
  
  const app = initializeApp(firebaseConfig);
  return getSdks(app);
}

function getSdks(app: any) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}


export async function getAiResponse(
  query: string,
  photoDataUri?: string
): Promise<MathAssistantOutput> {
  return await mathAssistant({ query, photoDataUri });
}

export async function getInitialPrompts(): Promise<GetStartedPromptOutput> {
  return await getStartedPrompt();
}

async function extractTextFromDataUri(fileDataUri: string): Promise<string> {
  const [, mimeType, , fileContent] = /^data:(.+);(charset=.+;)?base64,(.*)$/.exec(fileDataUri) ?? [];
  if (!mimeType || !fileContent) {
    throw new Error('Invalid Data URI format for text extraction.');
  }

  const buffer = Buffer.from(fileContent, 'base64');
  let textContent = '';

  try {
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      textContent = data.text;
    } else if (mimeType.startsWith('text/')) {
      textContent = buffer.toString('utf-8');
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
      const { value } = await mammoth.extractRawText({ buffer });
      textContent = value;
    } else {
      textContent = `[Contenido de tipo ${mimeType} no se puede procesar todavía.]`;
    }
  } catch (error) {
    console.error('Error processing file for text extraction:', error);
    throw new Error('Failed to extract text from the document.');
  }

  return textContent;
}

export async function uploadAndProcessDocument(
  fileDataUri: string,
  fileName: string,
  userId: string
): Promise<{ documentId: string, textContent: string }> {
  const { storage, firestore } = getFirebaseForServer();

  // 1. Convert Data URI to buffer for upload and processing
  const [, mimeType, , fileContent] = /^data:(.+);(charset=.+;)?base64,(.*)$/.exec(fileDataUri) ?? [];
  if (!mimeType || !fileContent) {
    throw new Error('Invalid Data URI format.');
  }
  const buffer = Buffer.from(fileContent, 'base64');

  // 2. Upload file to Firebase Storage
  const storagePath = `userDocuments/${userId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, buffer, { contentType: mimeType });

  // 3. Extract text content
  const textContent = await extractTextFromDataUri(fileDataUri);
  
  // 4. Save metadata to Firestore
  const docData = {
    userId,
    fileName,
    storagePath,
    textContent: textContent,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(firestore, 'userDocuments'), docData);
  
  return { documentId: docRef.id, textContent };
}
