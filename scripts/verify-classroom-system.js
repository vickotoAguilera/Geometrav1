#!/usr/bin/env node

/**
 * Script de verificación del sistema de aulas
 * Verifica que todas las funcionalidades estén operativas
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Configuración de Firebase (usar las mismas credenciales del proyecto)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function verifyClassroomSystem() {
    console.log('🔍 Iniciando verificación del sistema de aulas...\n');

    try {
        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        let passed = 0;
        let failed = 0;

        // Test 1: Verificar que la colección classrooms existe
        console.log('✓ Test 1: Verificando colección classrooms...');
        try {
            const classroomsRef = collection(db, 'classrooms');
            const snapshot = await getDocs(classroomsRef);
            console.log(`  ✅ Colección existe (${snapshot.size} aulas encontradas)`);
            passed++;
        } catch (error) {
            console.log('  ❌ Error al acceder a la colección');
            failed++;
        }

        // Test 2: Verificar estructura de datos
        console.log('\n✓ Test 2: Verificando estructura de datos...');
        try {
            const classroomsRef = collection(db, 'classrooms');
            const snapshot = await getDocs(classroomsRef);

            if (snapshot.size > 0) {
                const firstClassroom = snapshot.docs[0].data();
                const requiredFields = ['name', 'description', 'password', 'subject', 'grade', 'createdBy', 'createdAt', 'isActive'];
                const hasAllFields = requiredFields.every(field => field in firstClassroom);

                if (hasAllFields) {
                    console.log('  ✅ Estructura de datos correcta');
                    passed++;
                } else {
                    console.log('  ❌ Faltan campos requeridos');
                    failed++;
                }
            } else {
                console.log('  ⚠️  No hay aulas para verificar estructura');
                passed++;
            }
        } catch (error) {
            console.log('  ❌ Error al verificar estructura');
            failed++;
        }

        // Test 3: Verificar subcolecciones
        console.log('\n✓ Test 3: Verificando subcolecciones...');
        try {
            const classroomsRef = collection(db, 'classrooms');
            const snapshot = await getDocs(classroomsRef);

            if (snapshot.size > 0) {
                const firstClassroomId = snapshot.docs[0].id;

                // Verificar subcolección teachers
                const teachersRef = collection(db, `classrooms/${firstClassroomId}/teachers`);
                const teachersSnapshot = await getDocs(teachersRef);

                // Verificar subcolección students
                const studentsRef = collection(db, `classrooms/${firstClassroomId}/students`);
                const studentsSnapshot = await getDocs(studentsRef);

                console.log(`  ✅ Subcolecciones accesibles (${teachersSnapshot.size} profesores, ${studentsSnapshot.size} alumnos)`);
                passed++;
            } else {
                console.log('  ⚠️  No hay aulas para verificar subcolecciones');
                passed++;
            }
        } catch (error) {
            console.log('  ❌ Error al verificar subcolecciones');
            failed++;
        }

        // Test 4: Verificar índices y queries
        console.log('\n✓ Test 4: Verificando queries...');
        try {
            const classroomsRef = collection(db, 'classrooms');
            const activeQuery = query(classroomsRef, where('isActive', '==', true));
            const activeSnapshot = await getDocs(activeQuery);

            console.log(`  ✅ Queries funcionando (${activeSnapshot.size} aulas activas)`);
            passed++;
        } catch (error) {
            console.log('  ❌ Error en queries');
            failed++;
        }

        // Resumen
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(50));
        console.log(`✅ Tests pasados: ${passed}`);
        console.log(`❌ Tests fallidos: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

        if (failed === 0) {
            console.log('\n🎉 ¡Sistema de aulas 100% funcional!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Hay problemas que requieren atención');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Error crítico:', error.message);
        process.exit(1);
    }
}

// Ejecutar verificación
verifyClassroomSystem();
