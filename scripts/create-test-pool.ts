#!/usr/bin/env tsx

/**
 * Script para crear ejercicios de prueba simples
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const testExercises = [
    {
        id: 'test-1',
        type: 'fill-in-blanks',
        title: 'Suma Simple',
        description: 'Resuelve la siguiente suma',
        template: '¿Cuánto es 2 + 3? La respuesta es [___]',
        blanks: [
            {
                id: 'blank-1',
                correctAnswer: '5',
                acceptedAnswers: ['5', 'cinco'],
                caseSensitive: false
            }
        ],
        points: 10,
        difficulty: 'facil',
        hints: [
            { text: 'Cuenta con tus dedos: 2 dedos más 3 dedos', order: 1 },
            { text: 'La respuesta es un número entre 4 y 6', order: 2 },
            { text: 'La respuesta es 5', order: 3 }
        ]
    },
    {
        id: 'test-2',
        type: 'fill-in-blanks',
        title: 'Resta Simple',
        description: 'Resuelve la siguiente resta',
        template: '¿Cuánto es 10 - 4? La respuesta es [___]',
        blanks: [
            {
                id: 'blank-1',
                correctAnswer: '6',
                acceptedAnswers: ['6', 'seis'],
                caseSensitive: false
            }
        ],
        points: 10,
        difficulty: 'facil',
        hints: [
            { text: 'Empieza desde 10 y cuenta hacia atrás 4 veces', order: 1 },
            { text: 'La respuesta es mayor que 5', order: 2 },
            { text: 'La respuesta es 6', order: 3 }
        ]
    },
    {
        id: 'test-3',
        type: 'fill-in-blanks',
        title: 'Multiplicación Simple',
        description: 'Resuelve la siguiente multiplicación',
        template: '¿Cuánto es 3 × 4? La respuesta es [___]',
        blanks: [
            {
                id: 'blank-1',
                correctAnswer: '12',
                acceptedAnswers: ['12', 'doce'],
                caseSensitive: false
            }
        ],
        points: 10,
        difficulty: 'facil',
        hints: [
            { text: 'Es lo mismo que sumar 3 + 3 + 3 + 3', order: 1 },
            { text: 'La respuesta es un número par', order: 2 },
            { text: 'La respuesta es 12', order: 3 }
        ]
    }
];

async function uploadTestPool() {
    const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
    });

    const pool = {
        subject: 'prueba',
        grade: 'test',
        exercises: testExercises,
        version: 1,
        lastUpdated: new Date().toISOString(),
    };

    try {
        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || '',
            Key: 'exercises/test/prueba.json',
            Body: JSON.stringify(pool, null, 2),
            ContentType: 'application/json',
        }));

        console.log('✅ Pool de prueba subido exitosamente!');
        console.log(`   📦 3 ejercicios simples`);
        console.log(`   💡 Todos con hints`);
        console.log('\nEjercicios:');
        testExercises.forEach((ex, i) => {
            console.log(`   ${i + 1}. ${ex.title}: ${ex.question}`);
        });
    } catch (error) {
        console.error('❌ Error subiendo pool de prueba:', error);
        process.exit(1);
    }
}

uploadTestPool()
    .then(() => {
        console.log('\n✅ Listo! Ahora puedes acceder a /ejercicios/test/prueba');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
