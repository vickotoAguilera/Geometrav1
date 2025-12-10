
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
        : undefined;
    
    if (!serviceAccount) {
        console.error("❌ FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
        process.exit(1);
    }

    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

async function clearDatabase() {
    console.log("🧹 Iniciando limpieza de base de datos (Colección 'messages')...");
    
    try {
        // Use collectionGroup to find 'messages' collections across all users
        const snapshot = await db.collectionGroup('messages').get();
        
        if (snapshot.empty) {
            console.log("✅ No se encontraron mensajes para borrar.");
            return;
        }

        console.log(`⚠️ Se encontraron ${snapshot.size} mensajes. Borrando...`);

        const batch = db.batch();
        let count = 0;
        
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
            count++;
        });

        await batch.commit();
        console.log(`✅ ¡Éxito! Se han borrado ${count} mensajes de la base de datos.`);

    } catch (error) {
        console.error("❌ Error al borrar la base de datos:", error);
    }
}

clearDatabase();
