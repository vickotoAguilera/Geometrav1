// Test con una API key diferente
async function testWithDifferentKey() {
    // Probar con la key #52
    const apiKey = 'AIzaSyAT_JOZ8r98S45J-1v_EPgt1zbDODhR-8I';

    console.log('🧪 Testing with API key #52...');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Di "Hola mundo" en español.'
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

testWithDifferentKey();
