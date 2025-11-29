// Script para verificar que las variables de entorno se cargan correctamente

console.log('=== Verificación de Variables de Entorno ===\n');

console.log('Firebase:');
console.log('- NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Falta');

console.log('\nGemini AI:');
console.log('- GOOGLE_GENAI_API_KEY:', process.env.GOOGLE_GENAI_API_KEY ? '✅ Configurada' : '❌ Falta');

console.log('\nCloudflare R2:');
console.log('- R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID || '❌ UNDEFINED');
console.log('- R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? '✅ Configurada' : '❌ Falta');
console.log('- R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? '✅ Configurada' : '❌ Falta');
console.log('- R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || '❌ UNDEFINED');
console.log('- R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL || '❌ UNDEFINED');

console.log('\n=== Fin de Verificación ===');
