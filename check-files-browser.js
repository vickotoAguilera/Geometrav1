/**
 * Script simple para verificar archivos en Firestore usando consola del navegador
 * Copia y pega esto en la consola del navegador (F12)
 */

// INSTRUCCIONES:
// 1. Abre la consola del navegador (F12)
// 2. Copia y pega todo este código
// 3. Presiona Enter

(async function checkFiles() {
    try {
        // Obtener Firestore desde el contexto global
        const { getFirestore, collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');

        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) {
            console.error('❌ No hay usuario autenticado');
            return;
        }

        console.log('🔍 Verificando archivos del usuario:', user.uid);
        console.log('');

        const messagesRef = collection(db, 'users', user.uid, 'messages');
        const q = query(
            messagesRef,
            where('type', '==', 'fileContext'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log('❌ No se encontraron archivos en Firestore');
            console.log('');
            console.log('Esto significa que los archivos de Drive NO se guardaron.');
            console.log('Posibles causas:');
            console.log('  1. Error al procesar el archivo');
            console.log('  2. API key sin cuota');
            console.log('  3. Error en processGoogleDriveFile');
            return;
        }

        console.log(`✅ Encontrados ${snapshot.size} archivos:`);
        console.log('');

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`📄 Archivo #${index + 1}:`);
            console.log(`  ID: ${doc.id}`);
            console.log(`  Nombre: ${data.fileName || 'Sin nombre'}`);
            console.log(`  Activo: ${data.isActive ? '✅ SÍ' : '❌ NO'}`);
            console.log(`  Tipo: ${data.mimeType || 'N/A'}`);
            console.log(`  Fuente: ${data.source || 'local'}`);

            // Verificar campos de contenido
            const hasContent = !!data.content;
            const hasExtractedContent = !!data.extractedContent;
            const hasVisualDescription = !!data.visualDescription;

            console.log(`  Contenido disponible:`);
            console.log(`    - content: ${hasContent ? '✅' : '❌'}`);
            console.log(`    - extractedContent: ${hasExtractedContent ? '✅' : '❌'}`);
            console.log(`    - visualDescription: ${hasVisualDescription ? '✅' : '❌'}`);

            if (hasExtractedContent) {
                const preview = data.extractedContent.substring(0, 100);
                console.log(`    Preview: "${preview}..."`);
            }

            console.log('');
        });

        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('💡 Si NO hay archivos:');
        console.log('   - Revisa la consola por errores al adjuntar');
        console.log('   - Verifica que las API keys funcionen');
        console.log('');
        console.log('💡 Si SÍ hay archivos pero no aparece el panel:');
        console.log('   - El panel solo muestra archivos con isActive=true');
        console.log('   - Recarga la página del chat');

    } catch (error) {
        console.error('❌ Error:', error);
        console.log('');
        console.log('Si ves este error, ejecuta el código directamente en la consola');
        console.log('sin usar import. Necesitas que la app ya tenga Firebase cargado.');
    }
})();
