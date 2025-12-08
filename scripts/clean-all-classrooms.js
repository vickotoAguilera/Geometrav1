#!/usr/bin/env node

/**
 * Script para limpiar todas las aulas y empezar de cero
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(process.cwd(), 'geometra-firebase-adminsdk.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanAllClassrooms() {
    console.log('🧹 LIMPIANDO TODAS LAS AULAS\n');
    console.log('='.repeat(70));

    try {
        // 1. Eliminar todas las aulas
        console.log('\n1. Eliminando aulas de la colección principal...');
        const classroomsSnapshot = await db.collection('classrooms').get();
        console.log(`   Encontradas: ${classroomsSnapshot.size} aulas`);

        const batch = db.batch();
        let count = 0;

        for (const doc of classroomsSnapshot.docs) {
            // Eliminar subcollections primero
            const teachersSnapshot = await db.collection(`classrooms/${doc.id}/teachers`).get();
            teachersSnapshot.forEach(teacherDoc => {
                batch.delete(teacherDoc.ref);
                count++;
            });

            const studentsSnapshot = await db.collection(`classrooms/${doc.id}/students`).get();
            studentsSnapshot.forEach(studentDoc => {
                batch.delete(studentDoc.ref);
                count++;
            });

            const messagesSnapshot = await db.collection(`classrooms/${doc.id}/messages`).get();
            messagesSnapshot.forEach(msgDoc => {
                batch.delete(msgDoc.ref);
                count++;
            });

            // Eliminar el aula
            batch.delete(doc.ref);
            count++;
        }

        await batch.commit();
        console.log(`   ✅ Eliminados ${count} documentos`);

        // 2. Limpiar teacherClassrooms de todos los usuarios
        console.log('\n2. Limpiando teacherClassrooms de usuarios...');
        const usersSnapshot = await db.collection('users').get();

        for (const userDoc of usersSnapshot.docs) {
            const teacherClassroomsSnapshot = await db.collection(`users/${userDoc.id}/teacherClassrooms`).get();
            if (teacherClassroomsSnapshot.size > 0) {
                const userBatch = db.batch();
                teacherClassroomsSnapshot.forEach(doc => {
                    userBatch.delete(doc.ref);
                });
                await userBatch.commit();
                console.log(`   ✅ Limpiado usuario ${userDoc.id}: ${teacherClassroomsSnapshot.size} aulas`);
            }
        }

        // 3. Limpiar studentClassrooms de todos los usuarios
        console.log('\n3. Limpiando studentClassrooms de usuarios...');
        for (const userDoc of usersSnapshot.docs) {
            const studentClassroomsSnapshot = await db.collection(`users/${userDoc.id}/studentClassrooms`).get();
            if (studentClassroomsSnapshot.size > 0) {
                const userBatch = db.batch();
                studentClassroomsSnapshot.forEach(doc => {
                    userBatch.delete(doc.ref);
                });
                await userBatch.commit();
                console.log(`   ✅ Limpiado usuario ${userDoc.id}: ${studentClassroomsSnapshot.size} aulas`);
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ LIMPIEZA COMPLETADA');
        console.log('='.repeat(70));
        console.log('\nLa base de datos está limpia y lista para empezar de cero.\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    }

    process.exit(0);
}

cleanAllClassrooms();
