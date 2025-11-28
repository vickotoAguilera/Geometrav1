'use server';

/**
 * Server actions para el perfil de usuario
 */

import { uploadProfileImage } from '@/lib/r2-upload';

/**
 * Sube una foto de perfil a Cloudflare R2
 */
export async function uploadProfilePhoto(formData: FormData): Promise<{ url: string }> {
    try {
        const file = formData.get('photo') as File;

        if (!file) {
            throw new Error('No se proporcionó ningún archivo');
        }

        // Obtener userId del formData
        const userId = formData.get('userId') as string;

        if (!userId) {
            throw new Error('No se proporcionó el ID del usuario');
        }

        // Subir imagen a R2
        const url = await uploadProfileImage(file, userId);

        return { url };
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
}
