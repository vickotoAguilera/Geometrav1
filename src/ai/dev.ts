'use server';
/**
 * @fileOverview This file is the main entry point for Genkit development flows.
 * It imports all the flow definitions so they can be discovered by the Genkit
 * development server.
 */

import { config } from 'dotenv';
config();

import '@/ai/flows/math-assistant.ts';
import '@/ai/flows/get-started-prompt.ts';
import '@/ai/flows/study-assistant.ts';
import '@/ai/flows/generador-pruebas-flow.ts';
import '@/ai/flows/retroalimentacion-ia-flow.ts';
import '@/ai/flows/schemas/generador-pruebas-schemas.ts';
import '@/ai/flows/schemas/generador-paes-schemas.ts';
import '@/ai/flows/generador-paes-flow.ts';
import '@/ai/flows/retroalimentacion-paes-flow.ts';
import '@/ai/flows/tts-flow.ts';
import '@/ai/flows/schemas/tts-schemas.ts';
import '@/ai/flows/screenshot-assistant.ts';
import '@/ai/flows/funciones-matrices-assistant.ts';
import '@/ai/flows/schemas/funciones-matrices-schemas.ts';
import '@/ai/flows/teoria-calculadora-assistant.ts';
import '@/ai/flows/schemas/teoria-calculadora-schemas.ts';
import '@/ai/flows/verificador-tablas-flow.ts';
import '@/ai/flows/schemas/verificador-tablas-schemas.ts';
