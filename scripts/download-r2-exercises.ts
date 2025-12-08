/**
 * Script para descargar TODOS los ejercicios de R2 y organizarlos localmente
 * 
 * Estructura creada:
 * src/exercise-validation/
 *   ├── 1-medio/
 *   │   ├── ecuaciones-lineales.ts
 *   │   ├── factorizacion.ts
 *   │   └── ...
 *   ├── 2-medio/
 *   ├── 3-medio/
 *   ├── 4-medio/
 *   └── index.ts
 * 
 * Ejecutar: npx tsx scripts/download-r2-exercises.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

// Configurar cliente S3 para Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'exercise-validation');

// Cursos disponibles (nombres en R2)
const COURSES = [
    { folder: 'primero-medio', name: '1-medio' },
    { folder: 'segundo-medio', name: '2-medio' },
    { folder: 'tercero-medio', name: '3-medio' },
    { folder: 'cuarto-medio', name: '4-medio' },
];

interface ExercisePool {
    course: string;
    subject: string;
    exercises: any[];
}

async function listAllPools(): Promise<{ course: string; subject: string; key: string }[]> {
    const pools: { course: string; subject: string; key: string }[] = [];

    for (const course of COURSES) {
        try {
            const command = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: `exercises/${course.folder}/`,
            });

            const response = await s3Client.send(command);

            if (response.Contents) {
                for (const item of response.Contents) {
                    if (item.Key && item.Key.endsWith('.json')) {
                        const parts = item.Key.split('/');
                        const subject = parts[2].replace('.json', '');
                        pools.push({
                            course: course.name,
                            subject,
                            key: item.Key,
                        });
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️  Curso ${course.name} no encontrado en R2 (puede no tener ejercicios aún)`);
        }
    }

    return pools;
}

async function downloadPool(key: string): Promise<any> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();
    return JSON.parse(body || '{}');
}

function generateValidationFile(pool: ExercisePool): string {
    const { course, subject, exercises } = pool;

    // Convertir nombre de materia a camelCase para variable
    const varName = subject.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    let code = `/**
 * Validación de ejercicios: ${subject}
 * Curso: ${course}
 * 
 * Este archivo contiene las reglas de validación y retroalimentación
 * para los ejercicios de ${subject}.
 */

export interface ValidationRule {
    blankId: string;
    correctAnswers: string[];
    validation: {
        type: 'numeric' | 'algebraic' | 'text';
        caseSensitive?: boolean;
        acceptSpaces?: boolean;
        tolerance?: number;
    };
    feedback: {
        correct: string;
        almostCorrect?: string;
        incorrect: string;
        commonErrors?: Array<{
            answer: string;
            feedback: string;
        }>;
    };
}

export interface ExerciseValidation {
    id: number;
    question: string;
    blanks: ValidationRule[];
}

export const ${varName}Validation: ExerciseValidation[] = [\n`;

    // Procesar cada ejercicio
    exercises.forEach((exercise, index) => {
        if (exercise.type === 'fillInBlanks') {
            code += `    {
        id: ${index + 1},
        question: "${exercise.title || exercise.description}",
        blanks: [\n`;

            // Procesar cada blank
            exercise.blanks?.forEach((blank: any) => {
                const correctAnswers = Array.isArray(blank.correctAnswer)
                    ? blank.correctAnswer
                    : [blank.correctAnswer];

                code += `            {
                blankId: "${blank.id}",
                correctAnswers: ${JSON.stringify(correctAnswers)},
                validation: {
                    type: ${blank.tolerance !== undefined ? '"numeric"' : '"text"'},
                    caseSensitive: false,
                    acceptSpaces: true,
                    ${blank.tolerance !== undefined ? `tolerance: ${blank.tolerance},` : ''}
                },
                feedback: {
                    correct: "¡Correcto! ✅",
                    incorrect: "Revisa tu respuesta. Pista: ${blank.hint || 'Verifica el cálculo'}",
                },
            },\n`;
            });

            code += `        ],
    },\n`;
        }
    });

    code += `];

export default ${varName}Validation;
`;

    return code;
}

async function main() {
    console.log('🚀 Descargando ejercicios de R2...\n');

    // Crear directorio base
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Listar todos los pools
    const pools = await listAllPools();
    console.log(`📦 Encontrados ${pools.length} pools en R2\n`);

    let totalExercises = 0;
    const downloadedPools: ExercisePool[] = [];

    // Descargar cada pool
    for (const pool of pools) {
        try {
            console.log(`⬇️  Descargando: ${pool.course}/${pool.subject}...`);
            const data = await downloadPool(pool.key);

            const exercisePool: ExercisePool = {
                course: pool.course,
                subject: pool.subject,
                exercises: data.exercises || [],
            };

            downloadedPools.push(exercisePool);
            totalExercises += exercisePool.exercises.length;

            console.log(`   ✅ ${exercisePool.exercises.length} ejercicios descargados`);
        } catch (error) {
            console.error(`   ❌ Error descargando ${pool.key}:`, error);
        }
    }

    console.log(`\n📊 Total de ejercicios descargados: ${totalExercises}\n`);

    // Crear estructura de carpetas y archivos
    console.log('📁 Creando estructura de carpetas...\n');

    for (const course of COURSES) {
        const courseDir = path.join(OUTPUT_DIR, course.name);
        if (!fs.existsSync(courseDir)) {
            fs.mkdirSync(courseDir, { recursive: true });
        }
    }

    // Generar archivos TypeScript
    console.log('📝 Generando archivos de validación...\n');

    for (const pool of downloadedPools) {
        const courseDir = path.join(OUTPUT_DIR, pool.course);
        const filePath = path.join(courseDir, `${pool.subject}.ts`);

        const code = generateValidationFile(pool);
        fs.writeFileSync(filePath, code, 'utf-8');

        console.log(`   ✅ Creado: ${pool.course}/${pool.subject}.ts`);
    }

    // Crear archivo index.ts
    console.log('\n📝 Creando index.ts...\n');

    let indexCode = `/**
 * Índice de validaciones de ejercicios
 * 
 * Este archivo exporta todas las validaciones organizadas por curso y materia.
 */

`;

    // Importar todos los archivos
    for (const pool of downloadedPools) {
        const varName = pool.subject.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        indexCode += `import ${varName}Validation from './${pool.course}/${pool.subject}';\n`;
    }

    indexCode += `\nexport const validationsBySubject = {\n`;

    // Agrupar por curso
    for (const course of COURSES) {
        const coursePools = downloadedPools.filter(p => p.course === course.name);
        if (coursePools.length > 0) {
            indexCode += `    '${course.name}': {\n`;
            for (const pool of coursePools) {
                const varName = pool.subject.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                indexCode += `        '${pool.subject}': ${varName}Validation,\n`;
            }
            indexCode += `    },\n`;
        }
    }

    indexCode += `};\n\n`;

    indexCode += `export function getValidation(course: string, subject: string) {
    return validationsBySubject[course]?.[subject] || [];
}

export default validationsBySubject;
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexCode, 'utf-8');

    console.log('✅ index.ts creado\n');

    // Resumen final
    console.log('=' .repeat(60));
    console.log('✅ DESCARGA COMPLETADA\n');
    console.log(`📦 Pools descargados: ${downloadedPools.length}`);
    console.log(`📝 Ejercicios totales: ${totalExercises}`);
    console.log(`📁 Ubicación: ${OUTPUT_DIR}\n`);

    // Mostrar estructura
    console.log('📂 Estructura creada:');
    for (const course of COURSES) {
        const coursePools = downloadedPools.filter(p => p.course === course.name);
        if (coursePools.length > 0) {
            console.log(`\n   ${course.name}/`);
            for (const pool of coursePools) {
                console.log(`      ├── ${pool.subject}.ts (${pool.exercises.length} ejercicios)`);
            }
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
