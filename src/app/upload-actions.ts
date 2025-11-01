'use server';

import admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// Initialize admin only once
if (admin.apps.length === 0) {
  try {
    // Use environment variables for service account credentials
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}


interface UploadFileParams {
  fileDataUri: string;
  fileName: string;
  userId: string;
}

export async function uploadFileAction(params: UploadFileParams): Promise<{ downloadURL: string }> {
  const { fileDataUri, fileName, userId } = params;
  
  if (!fileDataUri) {
    throw new Error('File data URI is missing.');
  }

  const fileContent = fileDataUri.split(',')[1];
  if (!fileContent) {
      throw new Error('Invalid file data URI format.');
  }
  const fileBuffer = Buffer.from(fileContent, 'base64');
  
  const bucket = admin.storage().bucket();
  const filePath = `uploads/${userId}/${Date.now()}-${fileName}`;
  const file = bucket.file(filePath);

  try {
    const mimeType = fileDataUri.split(';')[0].split(':')[1];
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType || 'application/octet-stream', 
      },
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Set a far-future expiration date
    });

    return { downloadURL: url };
  } catch (error) {
    console.error('Server Action Upload Error:', error);
    throw new Error('File upload failed in Server Action.');
  }
}
