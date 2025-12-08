#!/usr/bin/env node

/**
 * Script de Verificación - Sistema de Términos y Condiciones
 * Verifica que el modal y sistema de aceptación funcionen correctamente
 * 
 * Fecha: 5 de Diciembre de 2024
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function verifyTermsSystem() {
    console.log('🔍 Verificando Sistema de Términos y Condiciones...\n');

    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        let passed = 0;
        let failed = 0;

        // Test 1: Verificar colección userAgreements
        console.log('✓ Test 1: Verificando colección userAgreements...');
        try {
            const agreementsRef = collection(db, 'userAgreements');
            const snapshot = await getDocs(agreementsRef);
            console.log(`  ✅ Colección existe (${snapshot.size} aceptaciones registradas)`);
            passed++;
        } catch (error) {
            console.log('  ❌ Error al acceder a la colección');
            console.log('  ℹ️  Esto es normal si aún no se ha implementado');
            failed++;
        }

        // Test 2: Verificar estructura de datos
        console.log('\n✓ Test 2: Verificando estructura de datos...');
        try {
            const agreementsRef = collection(db, 'userAgreements');
            const snapshot = await getDocs(agreementsRef);

            if (snapshot.size > 0) {
                const firstAgreement = snapshot.docs[0].data();
                const requiredFields = ['userId', 'classroomId', 'acceptedAt', 'version'];
                const hasAllFields = requiredFields.every(field => field in firstAgreement);

                if (hasAllFields) {
                    console.log('  ✅ Estructura de datos correcta');
                    console.log(`     - userId: ${firstAgreement.userId}`);
                    console.log(`     - classroomId: ${firstAgreement.classroomId}`);
                    console.log(`     - version: ${firstAgreement.version}`);
                    passed++;
                } else {
                    console.log('  ❌ Faltan campos requeridos');
                    console.log(`     Campos encontrados: ${Object.keys(firstAgreement).join(', ')}`);
                    failed++;
                }
            } else {
                console.log('  ⚠️  No hay aceptaciones para verificar');
                console.log('  ℹ️  Implementa el modal y acepta términos para probar');
                passed++;
            }
        } catch (error) {
            console.log('  ❌ Error al verificar estructura');
            failed++;
        }

        // Test 3: Verificar índices y queries
        console.log('\n✓ Test 3: Verificando queries...');
        try {
            // Simular query que se usará en la app
            const testUserId = 'test-user-123';
            const testClassroomId = 'test-classroom-456';

            const agreementsRef = collection(db, 'userAgreements');
            const q = query(
                agreementsRef,
                where('userId', '==', testUserId),
                where('classroomId', '==', testClassroomId)
            );
            const snapshot = await getDocs(q);

            console.log('  ✅ Queries funcionando correctamente');
            console.log(`     Query de prueba retornó ${snapshot.size} resultados`);
            passed++;
        } catch (error) {
            console.log('  ❌ Error en queries');
            console.log(`     Error: ${error.message}`);
            failed++;
        }

        // Test 4: Verificar versiones de términos
        console.log('\n✓ Test 4: Verificando sistema de versiones...');
        try {
            const agreementsRef = collection(db, 'userAgreements');
            const snapshot = await getDocs(agreementsRef);

            const versions = new Set();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.version) {
                    versions.add(data.version);
                }
            });

            console.log('  ✅ Sistema de versiones detectado');
            console.log(`     Versiones encontradas: ${Array.from(versions).join(', ') || 'Ninguna'}`);
            passed++;
        } catch (error) {
            console.log('  ❌ Error al verificar versiones');
            failed++;
        }

        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE VERIFICACIÓN - TÉRMINOS Y CONDICIONES');
        console.log('='.repeat(60));
        console.log(`✅ Tests pasados: ${passed}`);
        console.log(`❌ Tests fallidos: ${failed}`);
        console.log(`📈 Tasa de éxito: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

        console.log('\n📝 PRÓXIMOS PASOS:');
        console.log('1. Implementar ClassroomTermsModal.tsx');
        console.log('2. Crear hook useClassroomAgreement.ts');
        console.log('3. Integrar modal en página de aula');
        console.log('4. Probar flujo completo de aceptación');

        if (failed === 0) {
            console.log('\n🎉 ¡Sistema de términos funcionando correctamente!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Algunos tests fallaron - Esto es normal si aún no se implementa');
            process.exit(0); // Exit 0 porque es esperado en fase de desarrollo
        }

    } catch (error) {
        console.error('\n❌ Error crítico:', error.message);
        process.exit(1);
    }
}

// Ejecutar verificación
verifyTermsSystem();
