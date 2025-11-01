// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

async function uploadFileLogic(req) {
    const Busboy = require('busboy');
    return new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: req.headers });
        let uploadData = {};

        busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
            const fileBuffer = [];
            file.on('data', (data) => {
                fileBuffer.push(data);
            });
            file.on('end', () => {
                uploadData = {
                    buffer: Buffer.concat(fileBuffer),
                    filename,
                    mimeType,
                };
            });
        });

        busboy.on('finish', async () => {
            if (!req.query.uid) {
                return reject({ status: 401, message: 'User ID not provided' });
            }

            const { buffer, filename, mimeType } = uploadData;
            const userId = req.query.uid;

            const bucket = admin.storage().bucket();
            const filePath = `uploads/${userId}/${Date.now()}-${filename}`;
            const file = bucket.file(filePath);

            try {
                await file.save(buffer, {
                    metadata: {
                        contentType: mimeType,
                    },
                });

                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500',
                });

                resolve({ downloadURL: url });
            } catch (error) {
                console.error('Upload to GCS failed:', error);
                reject({ status: 500, message: 'Upload to Google Cloud Storage failed' });
            }
        });

        busboy.end(req.rawBody);
    });
}


exports.uploadFile = functions.https.onRequest(async (req, res) => {
  // Manejo manual de CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Responder a la solicitud preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const result = await uploadFileLogic(req);
    res.status(200).json(result);
  } catch (error) {
    console.error('Upload error:', error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Upload failed' });
  }
});

// Exporta la lógica para ser usada por Server Actions
exports.uploadFileLogic = uploadFileLogic;
    