'use server';

import admin from 'firebase-admin';

// Initialize admin only once
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: 'geometrachest.appspot.com',
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
    await file.save(fileBuffer, {
      metadata: {
        // Here you could determine the mimeType from the fileDataUri if needed
        // For simplicity, we'll let GCS auto-detect or use a generic type.
        contentType: 'application/octet-stream', 
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
