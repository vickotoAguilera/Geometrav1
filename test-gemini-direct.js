// Script de prueba simple para verificar la API de Gemini

async function testGeminiAPI() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY_51 || 'AIzaSyDzylX4g-XyAzDBaQEl8eIEveIVCJlHC7o';

    console.log('🧪 Testing Gemini API directly...');
    console.log('🔑 Using API key:', apiKey.substring(0, 20) + '...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Di "Hola mundo" en español.'
            }]
        }]
    };

    try {
        console.log('📡 Sending request to Gemini API...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📥 Response status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0]) {
            console.log('✅ Success! Response:', data.candidates[0].content.parts[0].text);
        } else if (data.error) {
            console.error('❌ API Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testGeminiAPI();
