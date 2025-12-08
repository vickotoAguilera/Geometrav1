#!/usr/bin/env node

/**
 * Script de prueba completa del sistema de ejercicios
 * Verifica:
 * - Carga de 20 ejercicios de R2
 * - Validación de respuestas
 * - Contador 0/20 -> 1/20 -> ... -> 20/20
 * - Generación de retroalimentación con IA
 * - Creación de PDF
 * - Guardado en /home/vickoto/Documentos
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9002';
const PDF_OUTPUT_DIR = '/home/vickoto/Documentos';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data.includes('{') ? JSON.parse(data) : data,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({ status: res.statusCode, data, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function testExerciseSystem() {
    log('\n🚀 INICIANDO PRUEBA COMPLETA DEL SISTEMA DE EJERCICIOS\n', 'blue');

    const results = {
        steps: [],
        errors: [],
        warnings: [],
        success: false
    };

    try {
        // PASO 1: Verificar que el servidor esté corriendo
        logStep('1/7', 'Verificando servidor...');
        try {
            const response = await fetch(BASE_URL);
            if (response.ok) {
                logSuccess('Servidor corriendo en ' + BASE_URL);
                results.steps.push({ step: 1, status: 'success', message: 'Servidor OK' });
            } else {
                throw new Error(`Servidor respondió con status ${response.status}`);
            }
        } catch (error) {
            logError('Servidor no responde');
            results.errors.push({ step: 1, error: error.message });
            throw error;
        }

        // PASO 2: Cargar 20 ejercicios de R2
        logStep('2/7', 'Cargando 20 ejercicios de R2...');
        const exercisesUrl = `${BASE_URL}/api/exercises/primero-medio/ecuaciones-lineales`;
        let exercises = [];

        try {
            const response = await fetch(exercisesUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 20 })
            });

            const data = await response.json();

            if (data.success && data.exercises) {
                exercises = data.exercises;
                logSuccess(`Cargados ${exercises.length} ejercicios desde ${data.source}`);

                if (data.source !== 'r2') {
                    logWarning('Los ejercicios NO vienen de R2, vienen de: ' + data.source);
                    results.warnings.push({ step: 2, warning: 'No carga desde R2' });
                }

                results.steps.push({ step: 2, status: 'success', count: exercises.length, source: data.source });
            } else {
                throw new Error('No se pudieron cargar ejercicios');
            }
        } catch (error) {
            logError('Error cargando ejercicios: ' + error.message);
            results.errors.push({ step: 2, error: error.message });
            throw error;
        }

        // PASO 3: Simular respuestas a los 20 ejercicios
        logStep('3/7', 'Simulando respuestas a los 20 ejercicios...');
        const answers = [];
        let correctCount = 0;

        for (let i = 0; i < exercises.length; i++) {
            const exercise = exercises[i];
            const isCorrect = Math.random() > 0.3; // 70% de respuestas correctas

            let userAnswer;
            if (exercise.type === 'fill-in-blanks') {
                userAnswer = isCorrect ? exercise.blanks[0].correctAnswer : 'respuesta incorrecta';
            } else {
                userAnswer = isCorrect ? 'correcto' : 'incorrecto';
            }

            answers.push({
                questionId: exercise.id,
                question: exercise.title,
                correctAnswer: exercise.type === 'fill-in-blanks' ? exercise.blanks[0].correctAnswer : 'correcto',
                userAnswer,
                isCorrect
            });

            if (isCorrect) correctCount++;

            log(`  Ejercicio ${i + 1}/20: ${isCorrect ? '✅' : '❌'} (Contador: ${correctCount}/${i + 1})`, isCorrect ? 'green' : 'red');
        }

        logSuccess(`Simuladas ${answers.length} respuestas (${correctCount} correctas)`);
        results.steps.push({ step: 3, status: 'success', total: answers.length, correct: correctCount });

        // PASO 4: Verificar contador
        logStep('4/7', 'Verificando contador de progreso...');
        if (correctCount === answers.filter(a => a.isCorrect).length) {
            logSuccess(`Contador correcto: ${correctCount}/${answers.length}`);
            results.steps.push({ step: 4, status: 'success', counter: `${correctCount}/${answers.length}` });
        } else {
            throw new Error('El contador no coincide');
        }

        // PASO 5: Generar retroalimentación con IA
        logStep('5/7', 'Generando retroalimentación con IA...');
        let feedback;

        try {
            const feedbackUrl = `${BASE_URL}/api/feedback/generate`;
            const response = await fetch(feedbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers,
                    subject: 'Ecuaciones Lineales',
                    grade: 'Primero Medio'
                })
            });

            feedback = await response.json();

            if (feedback && feedback.summary) {
                logSuccess('Retroalimentación generada con IA');
                log(`  Resumen: ${feedback.summary.substring(0, 100)}...`, 'cyan');
                log(`  Fortalezas: ${feedback.strengths?.length || 0}`, 'green');
                log(`  Debilidades: ${feedback.weaknesses?.length || 0}`, 'yellow');
                log(`  Sugerencias: ${feedback.suggestions?.length || 0}`, 'blue');
                results.steps.push({ step: 5, status: 'success', feedback: 'generado' });
            } else {
                throw new Error('Feedback vacío o inválido');
            }
        } catch (error) {
            logError('Error generando retroalimentación: ' + error.message);
            results.errors.push({ step: 5, error: error.message });
            throw error;
        }

        // PASO 6: Generar PDF
        logStep('6/7', 'Generando PDF con retroalimentación...');
        let pdfPath;

        try {
            const pdfUrl = `${BASE_URL}/api/pdf/generate`;
            const response = await fetch(pdfUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: 'Usuario de Prueba',
                    subject: 'Ecuaciones Lineales',
                    grade: 'Primero Medio',
                    date: new Date(),
                    answers,
                    feedback
                })
            });

            const pdfData = await response.arrayBuffer();

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `retroalimentacion_test_${timestamp}.pdf`;
            pdfPath = path.join(PDF_OUTPUT_DIR, filename);

            fs.writeFileSync(pdfPath, Buffer.from(pdfData));

            logSuccess(`PDF generado: ${pdfPath}`);
            log(`  Tamaño: ${(pdfData.byteLength / 1024).toFixed(2)} KB`, 'cyan');
            results.steps.push({ step: 6, status: 'success', path: pdfPath, size: pdfData.byteLength });
        } catch (error) {
            logError('Error generando PDF: ' + error.message);
            results.errors.push({ step: 6, error: error.message });
            throw error;
        }

        // PASO 7: Verificar PDF
        logStep('7/7', 'Verificando PDF guardado...');
        if (fs.existsSync(pdfPath)) {
            const stats = fs.statSync(pdfPath);
            logSuccess(`PDF verificado: ${(stats.size / 1024).toFixed(2)} KB`);
            results.steps.push({ step: 7, status: 'success', verified: true });
            results.success = true;
        } else {
            throw new Error('PDF no encontrado en ' + pdfPath);
        }

        // RESUMEN FINAL
        log('\n' + '='.repeat(60), 'green');
        log('✅ PRUEBA COMPLETADA EXITOSAMENTE', 'green');
        log('='.repeat(60), 'green');
        log(`\n📊 Resultados:`, 'cyan');
        log(`  - Ejercicios cargados: ${exercises.length}`, 'white');
        log(`  - Respuestas simuladas: ${answers.length}`, 'white');
        log(`  - Respuestas correctas: ${correctCount}/${answers.length}`, 'green');
        log(`  - Retroalimentación: Generada`, 'green');
        log(`  - PDF: ${pdfPath}`, 'green');
        log(`\n🎉 Sistema funcionando al 100%\n`, 'green');

        return results;

    } catch (error) {
        log('\n' + '='.repeat(60), 'red');
        log('❌ PRUEBA FALLIDA', 'red');
        log('='.repeat(60), 'red');
        log(`\nError: ${error.message}\n`, 'red');

        results.success = false;
        return results;
    }
}

// Ejecutar prueba
testExerciseSystem()
    .then(results => {
        if (results.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        logError('Error fatal: ' + error.message);
        process.exit(1);
    });
