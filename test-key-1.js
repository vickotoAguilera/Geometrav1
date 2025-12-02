// Test con API key #1 y modelo correcto
async function testWithKey1() {
    const apiKey = 'AIzaSyBPNGNXIqWJlEQfPyQMnKSJQHDCLqLJqsw';

    console.log('🧪 Testing with API key #1 and model gemini-2.0-flash...');

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
            console.log('📝 Response:', data.candidates[0].content.parts[0].text);
            return true;
        } else if (data.error) {
            console.error('❌ API Error:', data.error.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

testWithKey1();
