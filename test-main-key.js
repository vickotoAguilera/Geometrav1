// Test con la API key principal
async function testWithMainKey() {
    // Leer de las variables de entorno
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
        console.error('❌ No se encontró GOOGLE_GENAI_API_KEY en el entorno');
        return;
    }

    console.log('🧪 Testing with main API key and model gemini-2.0-flash...');
    console.log('🔑 Key:', apiKey.substring(0, 20) + '...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Genera una retroalimentación breve y motivadora para un estudiante de geometría que respondió 2 de 3 ejercicios correctamente.'
            }]
        }]
    };

    try {
        console.log('📡 Sending request...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 Response status:', response.status);

        const data = await response.json();

        if (data.candidates && data.candidates[0]) {
            console.log('✅ SUCCESS! The API works!');
            console.log('📝 Response:');
            console.log(data.candidates[0].content.parts[0].text);
            return true;
        } else if (data.error) {
            console.error('❌ API Error:', data.error.message);
            console.error('Full error:', JSON.stringify(data.error, null, 2));
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

testWithMainKey();
