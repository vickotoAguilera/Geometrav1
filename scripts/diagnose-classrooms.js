#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar aulas y permisos
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(process.cwd(), 'geometra-firebase-adminsdk.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diagnoseClassrooms() {
    console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE AULAS\n');
    console.log('='.repeat(70));

    const userId = 'kRJ3QUGPsCRxImr3zKH9vrHnbk03';

    try {
        // 1. Verificar perfil del usuario
        console.log('\n📋 1. PERFIL DEL USUARIO');
        console.log('-'.repeat(70));
        const profileRef = db.collection('users').doc(userId).collection('profile').doc('data');
        const profileDoc = await profileRef.get();

        if (profileDoc.exists) {
            const profile = profileDoc.data();
            console.log(`✅ Perfil encontrado`);
            console.log(`   Nombre: ${profile.displayName}`);
            console.log(`   Rol: ${profile.role}`);
            console.log(`   Email: ${profile.email || 'N/A'}`);
        } else {
            console.log('❌ Perfil NO encontrado');
        }

        // 2. Verificar aulas creadas
        console.log('\n\n📚 2. AULAS EN LA COLECCIÓN PRINCIPAL');
        console.log('-'.repeat(70));
        const classroomsSnapshot = await db.collection('classrooms').get();
        console.log(`Total de aulas: ${classroomsSnapshot.size}`);

        if (classroomsSnapshot.size > 0) {
            classroomsSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`\n   Aula ${index + 1}:`);
                console.log(`   ID: ${doc.id}`);
                console.log(`   Nombre: ${data.name}`);
                console.log(`   Contraseña: ${data.password}`);
                console.log(`   Creado por: ${data.createdBy}`);
                console.log(`   Es del usuario: ${data.createdBy === userId ? '✅ SÍ' : '❌ NO'}`);
            });
        }

        // 3. Verificar teacherClassrooms del usuario
        console.log('\n\n👨‍🏫 3. AULAS EN teacherClassrooms DEL USUARIO');
        console.log('-'.repeat(70));
        const teacherClassroomsRef = db.collection('users').doc(userId).collection('teacherClassrooms');
        const teacherClassroomsSnapshot = await teacherClassroomsRef.get();

        console.log(`Total en teacherClassrooms: ${teacherClassroomsSnapshot.size}`);

        if (teacherClassroomsSnapshot.size > 0) {
            teacherClassroomsSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`\n   Aula ${index + 1}:`);
                console.log(`   ID: ${doc.id}`);
                console.log(`   Rol: ${data.role}`);
                console.log(`   Fecha: ${data.joinedAt?.toDate?.() || 'N/A'}`);
            });
        } else {
            console.log('   ⚠️  NO hay aulas en teacherClassrooms');
            console.log('   Esto explica por qué no se muestran en la UI');
        }

        // 4. Verificar teachers dentro de cada aula
        console.log('\n\n🔍 4. VERIFICANDO PROFESORES EN CADA AULA');
        console.log('-'.repeat(70));

        for (const classroomDoc of classroomsSnapshot.docs) {
            const classroomId = classroomDoc.id;
            const teachersRef = db.collection('classrooms').doc(classroomId).collection('teachers');
            const teachersSnapshot = await teachersRef.get();

            console.log(`\n   Aula: ${classroomDoc.data().name} (${classroomId})`);
            console.log(`   Profesores: ${teachersSnapshot.size}`);

            teachersSnapshot.forEach(teacherDoc => {
                const isCurrentUser = teacherDoc.id === userId;
                console.log(`      - ${teacherDoc.id} ${isCurrentUser ? '✅ (TÚ)' : ''}`);
                console.log(`        Rol: ${teacherDoc.data().role}`);
            });
        }

        // 5. Diagnóstico y solución
        console.log('\n\n💡 5. DIAGNÓSTICO Y SOLUCIÓN');
        console.log('='.repeat(70));

        const hasClassrooms = classroomsSnapshot.size > 0;
        const hasTeacherClassrooms = teacherClassroomsSnapshot.size > 0;

        if (hasClassrooms && !hasTeacherClassrooms) {
            console.log('\n⚠️  PROBLEMA DETECTADO:');
            console.log('   - Hay aulas creadas en la colección principal');
            console.log('   - PERO no están en users/{userId}/teacherClassrooms');
            console.log('   - Por eso no se muestran en la UI');

            console.log('\n🔧 SOLUCIÓN:');
            console.log('   Voy a crear las relaciones faltantes...\n');

            for (const classroomDoc of classroomsSnapshot.docs) {
                const data = classroomDoc.data();
                if (data.createdBy === userId) {
                    const classroomId = classroomDoc.id;

                    // Crear en teacherClassrooms
                    await db.collection('users').doc(userId).collection('teacherClassrooms').doc(classroomId).set({
                        role: 'owner',
                        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
                    });

                    console.log(`   ✅ Agregado ${data.name} a teacherClassrooms`);
                }
            }

            console.log('\n✅ RELACIONES CREADAS EXITOSAMENTE');
        } else if (hasTeacherClassrooms) {
            console.log('\n✅ TODO ESTÁ CORRECTO');
            console.log('   Las aulas están correctamente vinculadas');
        } else {
            console.log('\n⚠️  NO HAY AULAS CREADAS');
            console.log('   Crea una nueva aula desde la UI');
        }

        // 6. Resumen final
        console.log('\n\n📊 RESUMEN FINAL');
        console.log('='.repeat(70));
        console.log(`Aulas totales: ${classroomsSnapshot.size}`);
        console.log(`Aulas del usuario: ${teacherClassroomsSnapshot.size}`);
        console.log(`Estado: ${hasTeacherClassrooms ? '✅ Funcional' : '⚠️  Necesita corrección'}`);

        console.log('\n🎯 PRÓXIMOS PASOS:');
        console.log('   1. Recarga la página /aulas');
        console.log('   2. Deberías ver tus aulas');
        console.log('   3. Si no aparecen, verifica la consola del navegador\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    }

    process.exit(0);
}

diagnoseClassrooms();
