const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Busboy = require('busboy');

admin.initializeApp();

exports.uploadFile = functions.https.onCall(async (data, context) => {
  // Verifica autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fileData, fileName, mimeType } = data;
  const userId = context.auth.uid;
  
  const bucket = admin.storage().bucket();
  const filePath = `uploads/${userId}/${Date.now()}-${fileName}`;
  
  try {
    await bucket.file(filePath).save(Buffer.from(fileData, 'base64'), {
      metadata: {
        contentType: mimeType,
      },
    });
    
    const [downloadURL] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Fecha muy lejana
    });
    
    return { downloadURL };
  } catch (error) {
    console.error('Upload error in Cloud Function:', error);
    throw new functions.https.HttpsError('internal', 'Error uploading file to Storage.');
  }
});
