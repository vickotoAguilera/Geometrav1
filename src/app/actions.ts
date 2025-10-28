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
import { getStorage, ref, uploadString } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// This function is now defined on the server-side to avoid client/server context issues.
async function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// This is a simplified server-side init.
async function getFirebaseForServer() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getSdks(app);
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
  const { firestore, firebaseApp } = await getFirebaseForServer();
  const storage = getStorage(firebaseApp);

  // 1. Extract text using Genkit flow
  const { textContent } = await processDocument({ fileDataUri });

  // 2. Upload original file to Firebase Storage from the server
  const storagePath = `userDocuments/${userId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);
  // This upload now happens on the server, bypassing client-side CORS issues.
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
