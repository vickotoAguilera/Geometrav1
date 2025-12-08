/**
 * Script para agregar un usuario a la colección de admins
 * Esto permite que las reglas de Firestore verifiquen si un usuario es admin
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

async function addAdminToCollection() {
    try {
        // Email del admin
        const adminEmail = 'contacto.geometra@gmail.com';

        console.log('🔐 Iniciando sesión como:', adminEmail);

        // Necesitas proporcionar la contraseña
        const password = process.argv[2];

        if (!password) {
            console.error('❌ Debes proporcionar la contraseña como argumento');
            console.log('Uso: npx tsx add-admin-to-collection.ts TU_CONTRASEÑA');
            process.exit(1);
        }

        // Iniciar sesión
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
        const user = userCredential.user;

        console.log('✅ Sesión iniciada:', user.uid);

        // Agregar a la colección de admins
        await setDoc(doc(db, 'admins', user.uid), {
            email: adminEmail,
            createdAt: serverTimestamp(),
            role: 'admin'
        });

        console.log('✅ Usuario agregado a la colección de admins');
        console.log('🎯 Ahora puedes acceder al panel de admin en: http://localhost:9002/admin/teacher-requests');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAdminToCollection();
