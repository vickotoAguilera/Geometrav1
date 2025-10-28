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
import { getStorage, ref, getDownloadURL, uploadString } from 'firebase/storage';
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
// It uses the automatic initialization provided by Firebase App Hosting.
async function getFirebaseForServer() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // When running on the server, we can leverage App Hosting's automatic
  // configuration. It's crucial to try this first.
  try {
    const app = initializeApp({}); // Pass empty config for auto-init
    return getSdks(app);
  } catch (e) {
    // If automatic init fails (e.g., local dev without env vars),
    // fall back to the config file.
    if (process.env.NODE_ENV !== 'production') {
      console.log('Automatic server-side Firebase initialization failed, falling back to firebaseConfig. This is normal for local development.');
      const app = initializeApp(firebaseConfig);
      return getSdks(app);
    } else {
      console.error('CRITICAL: Automatic server-side Firebase initialization failed in production.', e);
      // In a real production scenario, you might want to throw an error
      // or have more robust error handling.
      throw e;
    }
  }
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
