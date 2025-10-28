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
import { getStorage, ref, getSignedUrl } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Helper function to initialize Firebase on the server if not already done.
// This ensures we have a single instance.
function getFirebaseForServer() {
  if (getApps().length > 0) {
    const app = getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app),
    };
  }
  
  const app = initializeApp(firebaseConfig);
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

export async function getSignedUploadUrl(
  fileName: string,
  userId: string,
  contentType: string
): Promise<{ uploadUrl: string; storagePath: string }> {
  const { storage } = getFirebaseForServer();
  const storagePath = `userDocuments/${userId}/${Date.now()}_${fileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadUrl = await getSignedUrl(storageRef, {
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: contentType,
  });

  return { uploadUrl, storagePath };
}

export async function saveDocumentMetadata(
  userId: string,
  fileName: string,
  storagePath: string,
  textContent: string
): Promise<{ documentId: string }> {
  const { firestore } = getFirebaseForServer();

  // 1. Extract text using Genkit flow
  const processedDoc = await processDocument({ fileDataUri: `data:${fileName};base64,` });

  const docData = {
    userId,
    fileName,
    storagePath,
    textContent: processedDoc.textContent,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(firestore, 'userDocuments'), docData);
  return { documentId: docRef.id };
}