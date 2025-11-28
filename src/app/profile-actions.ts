'use server';

/**
 * Server actions para el perfil de usuario
 */

import { uploadProfileImage } from '@/lib/r2-upload';

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

