/**
 * Firestore para server-side (server actions)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin si no está inicializado
if (!getApps().length) {
    // En producción, usa las credenciales de las variables de entorno
    // En desarrollo, usa las credenciales del proyecto
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        };

    initializeApp({
        credential: cert(serviceAccount),
    });
}

export function getFirestore() {
    return getAdminFirestore();
}
