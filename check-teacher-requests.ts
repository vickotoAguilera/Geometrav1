/**
 * Script para verificar solicitudes de docente en Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function checkTeacherRequests() {
    try {
        console.log('🔍 Buscando solicitudes de docente...\n');

        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'));
        console.log(`📊 Total de usuarios: ${usersSnapshot.size}\n`);

        let foundRequests = 0;

        for (const userDoc of usersSnapshot.docs) {
            const profileSnapshot = await getDocs(
                collection(db, 'users', userDoc.id, 'profile')
            );

            if (!profileSnapshot.empty) {
                const profileData = profileSnapshot.docs[0].data();

                console.log(`👤 Usuario: ${profileData.email || 'Sin email'} (${userDoc.id})`);

                if (profileData.teacherRequest) {
                    foundRequests++;
                    console.log('   ✅ SOLICITUD DE DOCENTE ENCONTRADA:');
                    console.log('   📧 Email:', profileData.email);
                    console.log('   👤 Nombre:', profileData.displayName || profileData.nombre);
                    console.log('   📝 Estado:', profileData.teacherRequest.status);
                    console.log('   📅 Fecha:', profileData.teacherRequest.requestedAt?.toDate?.());
                    console.log('   💬 Razón:', profileData.teacherRequest.reason);
                    console.log('');
                } else {
                    console.log('   ❌ Sin solicitud de docente');
                }
            } else {
                console.log(`   ⚠️  Usuario ${userDoc.id} sin perfil`);
            }
            console.log('');
        }

        console.log(`\n📊 Resumen:`);
        console.log(`   Total usuarios: ${usersSnapshot.size}`);
        console.log(`   Solicitudes encontradas: ${foundRequests}`);

        if (foundRequests === 0) {
            console.log('\n⚠️  No se encontraron solicitudes de docente en la base de datos.');
            console.log('   Verifica que la solicitud se haya guardado correctamente.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkTeacherRequests();
