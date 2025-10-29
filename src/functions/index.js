const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Busboy = require('busboy');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.uploadFile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    try {
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
           return res.status(401).send('User ID not provided');
        }
        
        const { buffer, filename, mimeType } = uploadData;
        const userId = req.query.uid;
        
        const bucket = admin.storage().bucket();
        const filePath = `uploads/${userId}/${Date.now()}-${filename}`;
        const file = bucket.file(filePath);

        await file.save(buffer, {
          metadata: {
            contentType: mimeType,
          },
        });

        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500',
        });

        res.status(200).json({ downloadURL: url });
      });

      busboy.end(req.rawBody);

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
});
