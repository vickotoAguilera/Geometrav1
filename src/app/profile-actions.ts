/**
 * Server actions para el perfil de usuario
 */

import { uploadProfileImage } from '@/lib/r2-upload';
import { doc, updateDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Inicializar Firebase si no está inicializado
if (!getApps().length) {
    initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
}

const db = getFirestore();

/**
 * Sube una foto de perfil a Cloudflare R2
 * Recibe un blob ya optimizado desde el cliente
 */
export async function uploadProfilePhoto(formData: FormData): Promise<{ url: string }> {
    console.log('🔍 [SERVER] uploadProfilePhoto called');

    try {
        const blob = formData.get('photo') as Blob;
        console.log('📦 [SERVER] Blob received:', blob ? `${blob.size} bytes, type: ${blob.type}` : 'null');

        if (!blob) {
            throw new Error('No se proporcionó ningún archivo');
        }

        // Obtener userId del formData
        const userId = formData.get('userId') as string;
        console.log('👤 [SERVER] User ID:', userId);

        if (!userId) {
            throw new Error('No se proporcionó el ID del usuario');
        }

        console.log('📤 [SERVER] Calling uploadProfileImage...');
        // Subir blob a R2 (ya viene optimizado del cliente)
        const url = await uploadProfileImage(blob, userId);
        console.log('✅ [SERVER] Upload successful! URL:', url);

        return { url };
    } catch (error) {
        console.error('❌ [SERVER] Error uploading profile photo:', error);
        throw error;
    }
}

/**
 * Solicita el rol de docente para un usuario
 */
export async function requestTeacherRole(userId: string, reason: string): Promise<void> {
    try {
        const userRef = doc(db, 'users', userId, 'profile', 'data');

        await updateDoc(userRef, {
            teacherRequest: {
                status: 'pending',
                requestedAt: serverTimestamp(),
                reason,
            },
            updatedAt: serverTimestamp(),
        });

        console.log(`✅ Teacher role requested for user: ${userId}`);

        // Enviar email de notificación
        try {
            // Obtener datos del usuario
            const { getDoc } = await import('firebase/firestore');
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'teacher_request',
                    subject: `[Geometra] Nueva Solicitud de Docente - ${userData?.email || 'Usuario'}`,
                    userEmail: userData?.email || 'No disponible',
                    userName: userData?.displayName || userData?.nombre || 'Sin nombre',
                    metadata: {
                        reason
                    }
                })
            });
        } catch (emailError) {
            console.error('Error enviando email de solicitud:', emailError);
            // No bloquear el flujo si falla el email
        }
    } catch (error) {
        console.error('Error requesting teacher role:', error);
        throw new Error('No se pudo enviar la solicitud');
    }
}

/**
 * Obtiene el rol actual de un usuario
 */
export async function getUserRole(userId: string): Promise<string> {
    try {
        const { doc: getDoc } = await import('firebase/firestore');
        const userRef = doc(db, 'users', userId, 'profile', 'data');
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data().role || 'student';
        }

        return 'student';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'student';
    }
}

