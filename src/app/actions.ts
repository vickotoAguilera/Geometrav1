'use server';

import { mathAssistant, MathAssistantOutput } from '@/ai/flows/math-assistant';
import {
  getStartedPrompt,
  GetStartedPromptOutput,
} from '@/ai/flows/get-started-prompt';
import {
  processDocument,
  ProcessDocumentOutput,
} from '@/ai/flows/process-document';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getSdks } from '@/firebase'; // Assuming getSdks is available for server-side use

// This is a simplified server-side init. In a real app, you'd share this.
function getFirebaseForServer() {
  return getSdks(globalThis.firebaseApp);
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

export async function uploadAndProcessDocument(
  fileDataUri: string,
  fileName: string,
  userId: string
): Promise<{ documentId: string; textContent: string }> {
  const { firestore } = getFirebaseForServer();
  const storage = getStorage();

  // 1. Extract text using Genkit flow
  const { textContent } = await processDocument({ fileDataUri });

  // 2. Upload original file to Firebase Storage
  const storagePath = `userDocuments/${userId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);
  await uploadString(storageRef, fileDataUri, 'data_url');
  
  // 3. Save metadata and extracted text to Firestore
  const docData = {
    userId,
    fileName,
    storagePath,
    textContent,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(firestore, 'userDocuments'), docData);

  return { documentId: docRef.id, textContent };
}
