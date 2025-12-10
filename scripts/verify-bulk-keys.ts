
const keysToCheck = [
    "AIzaSyAf4_FDnNIIYp5cXYQaYnxoIbQ5NujT9SY",
    "AIzaSyCC4A2Di5RjfBHV4OtQ1Yn2BKPXqpeKXUc",
    "AIzaSyAQVNiqOrsu7_LZZxXswafQ0TWOspZIehg",
    "AIzaSyB7Tol1TizlWF53i_QzDOUuOZf5Jfs0-4U",
    "AIzaSyCt3-S7wMU9unB1YvWwxhY4ybvNpoEW07M",
    "AIzaSyAr8Qx0yl_3P6KcYERCZM0QIaCUQ7jCIDc",
    "AIzaSyAMV-WkbPwmNkYh2oWb5AQjTdZoqswt-yc",
    "AIzaSyBKS0AFhjou6PHtn1YuoCb8EjQ6LCEJdWY",
    "AIzaSyAa_LmH1acYNllQMWFCWDwgbtmZwwgCR2o",
    "AIzaSyCTpFBV-rHEaGz1ZBJmvbBOwpFF6c-e-Jg",
    "AIzaSyD4Rz5S7p5jAgiYtSYCW2n8UbkhGc8Kh50",
    "AIzaSyCbAwpTObMpKefpgM0Obs4GqRPXulRkoZU",
    "AIzaSyCAWgkaA56nT9aspXAm2Pl70Z8H8lXkGoA",
    "AIzaSyBjOfvsIiif6FQifFyhbg-zENwNh-MTG8c",
    "AIzaSyDmkBGBOlIbVPaHDBAfjVVHO3LYVpAFdwk",
    "AIzaSyC6bEUBuc0prFkuAuu2pJN-2q4kfirXwIw",
    "AIzaSyAHOBYEox5q6keRT2uYD0fbacqLDFKkoXg",
    "AIzaSyBQb-YVs0pF4Ybsyg-cPDjuzGvWCz3Fhkg",
    "AIzaSyCvpi4YBaNeapDK0CK3HgCXeo2CcpS0aeI",
    "AIzaSyBVgGXJweS-WVxy-Bq3MEU1OCJvxGx8sUU",
    "AIzaSyCN23seol2884D2tzCEbtjSKw90cbsu4O8",
    "AIzaSyCmzx4kiUS-Q1GjFd9n98u2ap0rJtz3LP8",
    "AIzaSyAr2A1MnFfSUkaf1NlHwmFkPQi_CvF7iCI",
    "AIzaSyDbnABvoJAk29I2iXY7XbeFzrHRE-jzlCE",
    "AIzaSyBOY-zT5VIucucGVRvKrKLYLE7BChFwNmI",
    "AIzaSyAuRvT2KpxoGKsA_nUi-Mt94pW2ikeo01s",
    "AIzaSyCnyjSd6qgYTDD5Lat9ZGA8K1m0HYcgUi0",
    "AIzaSyB66-OLtHc4a2bwjPxXtNetahiFxLoBuv0",
    "AIzaSyD8Riinqmm3BhK9CzkGZFfql7F_O_Qtj28",
    "AIzaSyCJkXCCqk_Htp1n6ijY6PkuvgGbxem7Dog",
    "AIzaSyDY4y9RWzskFrp1YSZ2Ykw3Bhl3BkSeNpc",
    "AIzaSyDRRhXRhWEO2tIc5wfFj0L0KT8-FEx04IM",
    "AIzaSyD2ZUZwam_96y2ARf03cH2nCIrtzYcmrqk",
    "AIzaSyBUXevJaFAi6VbeB1RSVTlRWlTfMEf-3yc"
];

async function verifyKeys() {
    console.log('--- Verificando 34 API Keys Proporcionadas ---');
    const aliveKeys = [];

    for (const apiKey of keysToCheck) {
        try {
            // Use listModels for a lighter check that confirms key validity
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            
            if (response.ok) {
                console.log(`✅ Alive: ${apiKey.substring(0, 10)}...`);
                aliveKeys.push(apiKey);
            } else {
                const data = await response.json().catch(() => ({}));
                console.log(`❌ Dead: ${apiKey.substring(0, 10)}... (${response.status} - ${data.error?.message || 'Error'})`);
            }
        } catch (e: any) {
            console.log(`❌ Error: ${apiKey.substring(0, 10)}... (${e.message})`);
        }
        // Increased delay to avoid 429 errors
        await new Promise(resolve => setTimeout(resolve, 2500));
    }
    
    console.log('\n--- RESUMEN ---');
    console.log(`Total Vivas: ${aliveKeys.length}`);
    if (aliveKeys.length > 0) {
        console.log('Keys Vivas para copiar:');
        console.log(JSON.stringify(aliveKeys));
    }
}

verifyKeys();
