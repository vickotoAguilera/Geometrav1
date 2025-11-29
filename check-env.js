// Script para verificar las variables de entorno
require('dotenv').config({ path: '.env.local' });

console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===\n');

const vars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

vars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mostrar solo los primeros y últimos caracteres para seguridad
        const masked = value.length > 10
            ? `${value.substring(0, 6)}...${value.substring(value.length - 4)}`
            : value;
        console.log(`✅ ${varName}: ${masked}`);
    } else {
        console.log(`❌ ${varName}: NO DEFINIDA`);
    }
});

console.log('\n=== FIN DE VERIFICACIÓN ===');
