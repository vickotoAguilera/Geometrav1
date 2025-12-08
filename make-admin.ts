/**
 * Script para convertir un usuario en administrador
 * Uso: npx tsx make-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function makeUserAdmin() {
    try {
        console.log('🔍 Buscando usuarios...');

        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'));

        console.log(`\n📋 Usuarios encontrados: ${usersSnapshot.size}\n`);

        const users: Array<{ id: string; email: string; role: string }> = [];

        for (const userDoc of usersSnapshot.docs) {
            const profileSnapshot = await getDocs(
                collection(db, 'users', userDoc.id, 'profile')
            );

            if (!profileSnapshot.empty) {
                const profileData = profileSnapshot.docs[0].data();
                users.push({
                    id: userDoc.id,
                    email: profileData.email || 'Sin email',
                    role: profileData.role || 'student'
                });
            }
        }

        // Mostrar usuarios
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} - Rol: ${user.role} (ID: ${user.id})`);
        });

        // Por defecto, hacer admin al primer usuario
        if (users.length > 0) {
            const userToUpdate = users[0];
            console.log(`\n✨ Convirtiendo a ${userToUpdate.email} en administrador...`);

            const userRef = doc(db, 'users', userToUpdate.id, 'profile', 'data');

            await updateDoc(userRef, {
                role: 'admin',
                updatedAt: serverTimestamp(),
            });

            console.log(`✅ ${userToUpdate.email} ahora es administrador!`);
            console.log(`\n🔗 Accede al panel de admin en: http://localhost:9002/admin/teacher-requests`);
        } else {
            console.log('❌ No se encontraron usuarios');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

makeUserAdmin();
