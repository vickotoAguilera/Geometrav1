// Test con el modelo correcto: gemini-2.0-flash (NO experimental)
async function testWithCorrectModel() {
    const apiKey = 'AIzaSyAT_JOZ8r98S45J-1v_EPgt1zbDODhR-8I';

    console.log('🧪 Testing with CORRECT model: gemini-2.0-flash...');

    // Usar gemini-2.0-flash, NO gemini-2.0-flash-exp
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Genera una retroalimentación breve para un estudiante que respondió 2 de 3 ejercicios correctamente en geometría.'
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
            console.log('✅ Success! Response:', data.candidates[0].content.parts[0].text);
        } else if (data.error) {
            console.error('❌ API Error:', data.error.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testWithCorrectModel();
