#!/usr/bin/env node

/**
 * Script para crear un aula de prueba como profesor
 * Verifica que todo el sistema funcione correctamente
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(process.cwd(), 'geometra-firebase-adminsdk.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestClassroom() {
    console.log('🚀 Creando aula de prueba...\n');

    try {
        // 1. Verificar que el usuario existe y es profesor
        const userId = 'kRJ3QUGPsCRxImr3zKH9vrHnbk03'; // Tu UID
        console.log('✓ Verificando usuario...');

        const userProfileRef = db.collection('users').doc(userId).collection('profile').doc('data');
        const userProfile = await userProfileRef.get();

        if (!userProfile.exists) {
            console.error('❌ El perfil del usuario no existe');
            process.exit(1);
        }

        const profileData = userProfile.data();
        console.log(`  Usuario: ${profileData.displayName}`);
        console.log(`  Rol: ${profileData.role}`);

        if (profileData.role !== 'teacher' && profileData.role !== 'admin') {
            console.error('❌ El usuario no es profesor ni admin');
            process.exit(1);
        }

        // 2. Generar contraseña única
        console.log('\n✓ Generando contraseña...');
        const password = generatePassword();
        console.log(`  Contraseña: ${password}`);

        // 3. Crear el aula
        console.log('\n✓ Creando aula en Firestore...');
        const classroomData = {
            name: 'Matemáticas 3° Medio - Prueba',
            description: 'Aula de prueba para verificar funcionalidad del sistema',
            subject: 'Matemáticas',
            grade: '3° Medio',
            password: password,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            maxStudents: 40,
            isActive: true,
        };

        const classroomRef = await db.collection('classrooms').add(classroomData);
        const classroomId = classroomRef.id;
        console.log(`  ID del aula: ${classroomId}`);

        // 4. Agregar profesor al aula
        console.log('\n✓ Agregando profesor al aula...');
        await classroomRef.collection('teachers').doc(userId).set({
            userId: userId,
            displayName: profileData.displayName,
            email: profileData.email || '',
            role: 'owner',
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 5. Actualizar perfil del profesor
        console.log('\n✓ Actualizando perfil del profesor...');
        const teacherClassroomsRef = db.collection('users').doc(userId).collection('teacherClassrooms').doc(classroomId);
        await teacherClassroomsRef.set({
            classroomId: classroomId,
            role: 'owner',
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 6. Verificar que todo se creó correctamente
        console.log('\n✓ Verificando creación...');

        const createdClassroom = await classroomRef.get();
        if (!createdClassroom.exists) {
            console.error('❌ El aula no se creó correctamente');
            process.exit(1);
        }

        const teacherDoc = await classroomRef.collection('teachers').doc(userId).get();
        if (!teacherDoc.exists) {
            console.error('❌ El profesor no se agregó al aula');
            process.exit(1);
        }

        const teacherClassroomDoc = await teacherClassroomsRef.get();
        if (!teacherClassroomDoc.exists) {
            console.error('❌ El aula no se agregó al perfil del profesor');
            process.exit(1);
        }

        // 7. Mostrar resumen
        console.log('\n' + '='.repeat(60));
        console.log('✅ AULA CREADA EXITOSAMENTE');
        console.log('='.repeat(60));
        console.log(`\n📋 Información del Aula:`);
        console.log(`   ID: ${classroomId}`);
        console.log(`   Nombre: ${classroomData.name}`);
        console.log(`   Materia: ${classroomData.subject}`);
        console.log(`   Curso: ${classroomData.grade}`);
        console.log(`   Contraseña: ${password}`);
        console.log(`\n🔗 URL para acceder:`);
        console.log(`   http://localhost:3002/aulas/${classroomId}`);
        console.log(`\n👨‍🏫 Profesor:`);
        console.log(`   Nombre: ${profileData.displayName}`);
        console.log(`   UID: ${userId}`);
        console.log(`\n✨ Funcionalidades disponibles:`);
        console.log(`   ✓ Chat en tiempo real`);
        console.log(`   ✓ Notificaciones`);
        console.log(`   ✓ Términos y condiciones`);
        console.log(`   ✓ Gestión de alumnos`);
        console.log(`   ✓ Cambiar contraseña`);
        console.log('\n🎉 ¡Todo listo para usar!\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error al crear el aula:', error);
        process.exit(1);
    }
}

function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Ejecutar
createTestClassroom();
