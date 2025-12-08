/**
 * Script para verificar archivos guardados en Firestore
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = require('./geometra-firebase-adminsdk.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkUserFiles(userId) {
    try {
        console.log(`🔍 Verificando archivos del usuario: ${userId}\n`);

        const messagesRef = db.collection('users').doc(userId).collection('messages');
        const snapshot = await messagesRef
            .where('type', '==', 'fileContext')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            console.log('❌ No se encontraron archivos en Firestore\n');
            return;
        }

        console.log(`✅ Encontrados ${snapshot.size} archivos:\n`);

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`Archivo #${index + 1}:`);
            console.log(`  ID: ${doc.id}`);
            console.log(`  Nombre: ${data.fileName || 'Sin nombre'}`);
            console.log(`  Activo: ${data.isActive ? '✅' : '❌'}`);
            console.log(`  Tipo MIME: ${data.mimeType || 'N/A'}`);
            console.log(`  Fuente: ${data.source || 'local'}`);
            console.log(`  Tamaño: ${data.fileSize ? (data.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}`);

            // Verificar qué campos tiene
            const hasContent = !!data.content;
            const hasExtractedContent = !!data.extractedContent;
            const hasVisualDescription = !!data.visualDescription;

            console.log(`  Campos de contenido:`);
            console.log(`    - content: ${hasContent ? '✅' : '❌'}`);
            console.log(`    - extractedContent: ${hasExtractedContent ? '✅' : '❌'}`);
            console.log(`    - visualDescription: ${hasVisualDescription ? '✅' : '❌'}`);

            if (hasExtractedContent) {
                const preview = data.extractedContent.substring(0, 100);
                console.log(`    Preview: ${preview}...`);
            }

            console.log(`  Creado: ${data.createdAt?.toDate?.() || 'N/A'}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Obtener userId del argumento o usar uno por defecto
const userId = process.argv[2];

if (!userId) {
    console.log('❌ Uso: node check-firestore-files.js <userId>');
    console.log('\nPara obtener tu userId:');
    console.log('1. Abre la consola del navegador (F12)');
    console.log('2. Ejecuta: firebase.auth().currentUser.uid');
    console.log('3. Copia el ID y ejecútalo: node check-firestore-files.js <tu-user-id>');
    process.exit(1);
}

checkUserFiles(userId).then(() => process.exit(0));
