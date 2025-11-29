/**
 * Firestore para server-side (server actions)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin si no está inicializado
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL)
        ? {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
        : null;

if (serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount),
    });
} else {
    console.warn('⚠️ Firebase Admin no se pudo inicializar: Faltan credenciales (FIREBASE_SERVICE_ACCOUNT o FIREBASE_PRIVATE_KEY/CLIENT_EMAIL)');
}

export function getFirestore() {
    return getAdminFirestore();
}
