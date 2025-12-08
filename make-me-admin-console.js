/**
 * Script simple para hacer admin al usuario actual
 * Ejecutar desde el navegador en la consola
 */

// Copia y pega esto en la consola del navegador (F12) cuando estés logueado:

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getAuth } from 'firebase/auth';

async function makeCurrentUserAdmin() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        console.error('❌ No hay usuario logueado');
        return;
    }

    try {
        const userRef = doc(db, 'users', user.uid, 'profile', 'data');

        await updateDoc(userRef, {
            role: 'admin',
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Ahora eres administrador!');
        console.log('🔄 Recarga la página para ver los cambios');
        console.log('🔗 Ve a: http://localhost:9002/admin/teacher-requests');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

makeCurrentUserAdmin();
